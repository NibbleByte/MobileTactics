//===============================================
// GameWorld entity system
//
// Contains current state of this world.
//===============================================
"use strict";

var GameWorld = function () {
	var self = this;
	
	// 
	// Common properties
	//
	var m_columns = 0;
	var m_rows = 0;
	var m_tiles = [];
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(ECS.EntityWorld.Events.ENTITY_ADDED, onEntityAdded);
		self._eworldSB.subscribe(ECS.EntityWorld.Events.ENTITY_REMOVED, onEntityRemoved);
	}
	
	//
	// Handle tiles
	//
	this.getColumns = function () {
		return m_columns;
	}
	
	this.getRows = function () {
		return m_rows;
	}
		
	this.clearTiles = function() {
		for(var i = 0; i < m_rows; ++i) {
			for(var j = 0; j < m_columns; ++j) {
				var tile = self.getTile(i, j);
				
				if (tile) {
					tile.destroy();
				}
			}
		}
		
		m_rows = 0;
		m_columns = 0;
		m_tiles = [];
	}
	
	this.getTile = function (row, column) {
		if (m_tiles[row]) { 
			return m_tiles[row][column] || null;
		} else {
			return null;
		}
	}
	
	this.getAdjacentTiles = function(tile) {
		var row = tile.CTile.row;
		var column = tile.CTile.column;
		
		var adjacentTiles = [];
		
		var adjacentPusher = function(r, c) {
			var tile = self.getTile(r, c);
			if (tile) {
				adjacentTiles.push(tile);
			}
		} 
		
		adjacentPusher(row, column + 1);
		adjacentPusher(row, column - 1);
		
		adjacentPusher(row - 1, column);
		adjacentPusher(row + 1, column);
		
		adjacentPusher(row + 1, column + 1);
		adjacentPusher(row - 1, column - 1);
		
		return adjacentTiles;
	}
	
	this.iterateAllTiles = function (functor) {
		for(var i = 0; i < m_tiles.length; ++i) {

			if (!m_tiles[i])
				continue;

			for(var j = 0; j < m_tiles[i].length; ++j) {
				if (m_tiles[i][j])
					functor(m_tiles[i][j]);
			}
		}
	}

	// Return array of tiles that passes the filter test.
	this.filterTiles = function (filterHandler) {
		var tiles = [];

		self.iterateAllTiles(function (tile) {
			if (filterHandler(tile)) {
				tiles.push(tile);
			}
		});

		return tiles;
	}


	// Gather tiles based on a cost resulted in a custom user query.
	// Note: Start tile is always discarded.
	// - userData is passed onto the user query.
	// - startTile is the start tile.
	// - startCost is the starting 
	// - gatherQuery is a custom user function with the following parameters: userData, tile.
	//	 The query should return an object with the following properties: cost, passOver, discard
	//	 * cost - the cost that takes to pass over this tile.
	//	 * passOver - can it passOver this tile (although it might be discarded).
	//	 * discard the tile for sure from the final list.
	this.gatherTiles = function (startTile, startCost, gatherQuery, userData) {
		var gatheredTiles = [];

		var open = [startTile];
		var visited = [];

		startTile.__$costLeft = startCost;
		startTile.__$cameFrom = null;
		startTile.__$discard = true;	// Start is always discarded.

		while(open.length != 0) {
			var openTile = open.shift();
			var openCostLeft = openTile.__$costLeft;
			
			var adjacentTiles = self.getAdjacentTiles(openTile);
			
			for(var i = 0; i < adjacentTiles.length; ++i) {
				var tile = adjacentTiles[i];
				
				if (tile == openTile.__$cameFrom) {
					continue;
				}

				var queryResult = gatherQuery(tile, userData);
				
				if (queryResult.cost == undefined)
					continue;
				
				var costLeft = openCostLeft - queryResult.cost;
				var oldCostLeft = tile.__$costLeft || 0;
				
				if (oldCostLeft <= costLeft
					&& queryResult.passOver
					&& costLeft >= 0
					) {
					tile.__$costLeft = costLeft;
					tile.__$cameFrom = openTile;
					tile.__$discard = queryResult.discard;
					
					if (!open.contains(tile)) {
						open.push(tile);
					}
				}
			}
			
			
			if (!visited.contains(openTile)) {
				
				// When searching for closed tiles, recent ones should be in front because they are more likely to be needed.
				visited.unshift(openTile);
				
				// Can't stack units.
				if (openTile != startTile && !openTile.__$discard) {
					gatheredTiles.push(openTile);
				}
			}
		}
		
		
		// Cleanup algorithm data.
		for(var i = 0; i < visited.length; ++i) {
			delete visited[i].__$costLeft;
			delete visited[i].__$cameFrom;
			delete visited[i].__$discard;
		}

		return gatheredTiles;
	}


	// Find path based on the lowest cost resulted in a custom user query.
	// Returns tiles that make up the path or null if no path found.
	// Note: Start tile is always discarded.
	// - userData is passed onto the user query.
	// - startTile is the start tile.
	// - endTiles can be a single tile or an array of tiles. If array, stop at the first found end tile.
	// - gatherQuery is a custom user function with the following parameters: userData, tile.
	//	 The query should return an object with the following properties: cost, passOver, discard
	//	 * cost - the cost that takes to pass over this tile.
	//	 * passOver - can it passOver this tile (although it might be discarded).
	//	 * discard the tile for sure from the final list.
	this.findPath = function (startTile, endTiles, gatherQuery, userData) {

		var isMultiTarget = Utils.isArray(endTiles);
		var open = [startTile];
		var visited = [startTile];

		var bestTile = null;
		var bestTileDist = Infinity;

		startTile.__$cost = 0;
		startTile.__$cameFrom = null;
		startTile.__$discard = true;	// Start is always discarded.

		while(open.length != 0) {
			var openTile = open.shift();
			var openCost = openTile.__$cost;

			// Check if this tile is any end tile.
			if (openTile == endTiles || (isMultiTarget && endTiles.contains(openTile))) {
				bestTile = openTile;
				break;
			}

			// Keep look out for the closest tile possible.
			var dist = self.getLowestDistance(openTile, endTiles);
			if (dist < bestTileDist || (dist == bestTileDist && openTile.__$cost < bestTile.__$cost)) {
				bestTile = openTile;
				bestTileDist = dist;
			}
			
			var adjacentTiles = self.getAdjacentTiles(openTile);
			
			for(var i = 0; i < adjacentTiles.length; ++i) {
				var tile = adjacentTiles[i];
				
				if (tile == openTile.__$cameFrom) {
					continue;
				}

				var queryResult = gatherQuery(tile, userData);
				
				if (queryResult.cost == undefined)
					continue;


				// Check if cost is lower than previous one. Then this is shorter path.
				if ((!tile.__$cost || openCost + queryResult.cost < tile.__$cost) && queryResult.passOver ) {
					tile.__$cost = openCost + queryResult.cost;
					tile.__$cameFrom = openTile;
					
					if (!open.contains(tile)) {
						open.push(tile);
						open.sort(findPathSort);

						tile.__$discard = queryResult.discard;

						// Store all tiles touched by the algorithm (to clean up later).
						if (!visited.contains(tile)) {
							visited.push(tile);
						}
					}

				}

			}
		}
		

		if (bestTile != null) {

			var pathTiles = [];
			var tile = bestTile;
			while(tile != null) {
				if (!tile.__$discard)
					pathTiles.unshift(tile);
				tile = tile.__$cameFrom;
			}

		} else {
			pathTiles = null;
		}
		
		// Cleanup algorithm data.
		for(var i = 0; i < visited.length; ++i) {
			delete visited[i].__$cost;
			delete visited[i].__$cameFrom;
			delete visited[i].__$discard;
		}

		return pathTiles;
	}


	this.getTilesOnRadius = function (tileCenter, radius) {
		return self.getTilesInArea(tileCenter, 0, radius, false, true);
	}

	// Faster than gather.
	this.getTilesInArea = function (tileCenter, radiusMin, radius, includeStartTile, onEdgeOnly) {

		if (radius == 0) {
			if (onEdgeOnly)
				return [tileCenter];

			if (includeStartTile)
				return [tileCenter];
			else
				return [];
		}


		var open = [tileCenter];
		var visited = [tileCenter];
		var result = []

		while (open.length != 0) {
			var openTile = open.shift();
			var adjacentTiles = self.getAdjacentTiles(openTile);

			for (var i = 0; i < adjacentTiles.length; ++i) {
				var tile = adjacentTiles[i];

				var dist = self.getDistance(tileCenter, tile);

				if (dist >= radiusMin && dist <= radius && !visited.contains(tile)) {
					visited.push(tile);
					open.push(tile);


					if (dist == radius || (!onEdgeOnly && dist <= radius))
						result.push(tile);
				}
			}
		}

		if (includeStartTile)
			result.unshift(tileCenter);

		return result;
	}

	var findPathSort = function (tile1, tile2) {
		return tile1.__$cost - tile2.__$cost;
	}
	
	
	var addTile = function (tile) {		
		var row = tile.CTile.row;
		var column = tile.CTile.column;
		
		console.assert(row >= 0);
		console.assert(column >= 0);
		
		if (m_tiles[row] == undefined)
			m_tiles[row] = [];
		
		m_tiles[row][column] = tile;
		
		self._eworld.triggerAsync(EngineEvents.World.TILE_ADDED, tile);
		
		// Resize grid
		if (m_rows - 1 < row) {
			m_rows = row + 1;
		}
		if (m_columns - 1 < column) {
			m_columns = column + 1;
		}
	}
	
	var removeTile = function (tile) {
		
		// Remove placeables if has any. Will be detached on destroying entity.
		while(tile.CTile.placedObjects.length > 0) {
			tile.CTile.placedObjects[0].destroy();
		}

		self._eworld.trigger(EngineEvents.World.TILE_REMOVING, tile);
		
		var row = tile.CTile.row;
		var column = tile.CTile.column;
		
		var tilesRow = m_tiles[row]; 
		
		delete tilesRow[column];
		
		// Resize array and check if hasn't become empty
		var index = m_tiles[row].length - 1;
		while(index >= 0) {
			if (tilesRow[index])
				break;
			
			index--;
		}
		
		if (index == -1) {
			delete m_tiles[row];
		} else {
			tilesRow.length = index + 1;
		}
		
		
		// Same goes for rows
		index = m_tiles.length - 1;
		while(index >= 0) {
			if (m_tiles[index])
				break;
			
			index--;
		}
		
		m_tiles.length = index + 1;

		self._eworld.trigger(EngineEvents.World.TILE_REMOVED);
	}
	
		

	//
	// Placed objects handling
	//	
	this.place = function (placeable, tile) {
		// Detach from previous tile
		var oldTile = placeable.CTilePlaceable.tile;
		if (oldTile) {
			oldTile.CTile.removeObject(placeable);
		}
		
		placeable.CTilePlaceable.tile = tile;
		tile.CTile.placedObjects.push(placeable);
		
		// Needed to distinguish when is moving and when moved has occurred (order of events). 
		self._eworld.trigger(EngineEvents.Placeables.PLACEABLE_MOVING, placeable);
		self._eworld.trigger(EngineEvents.Placeables.PLACEABLE_MOVED, placeable);
	};
	
	this.getPlaceablesInArea = function (tileCenter, radiusMin, radius, excludePlaceable) {
		var placeables = [];
		
		for(var i = 0; i < m_placeables.length; ++i) {
			var placeable = m_placeables[i];
			var dist = self.getDistance(tileCenter, placeable.CTilePlaceable.tile);

			if (dist >= radiusMin && dist <= radius && placeable != excludePlaceable) {
				placeables.push(placeable);
			}
		}
		
		return placeables;
	}

	this.iterateAllPlaceables = function (functor) {
		for (var i = 0; i < m_placeables.length; ++i) {
			functor(m_placeables[i]);
		}
	}
	
	var registerPlaceable = function (placeable) {
		
		m_placeables.push(placeable);
		
		self._eworld.trigger(EngineEvents.Placeables.PLACEABLE_REGISTERED, placeable);
	}
	
	var unregisterPlaceable = function (placeable) {
		
		var foundIndex = m_placeables.indexOf(placeable);
		
		if (foundIndex == -1)
			return false;
		
		self._eworld.trigger(EngineEvents.Placeables.PLACEABLE_UNREGISTERING, placeable);
		
		placeable.CTilePlaceable.tile.CTile.removeObject(placeable);
		m_placeables.splice(foundIndex, 1);
		
		self._eworld.trigger(EngineEvents.Placeables.PLACEABLE_UNREGISTERED);

		return true;
	}
	
	
	
	var onEntityAdded = function (entity) {
		
		if (entity.hasComponents(CTile)) {
			addTile(entity);
		} else if (entity.hasComponents(CTilePlaceable)) {
			registerPlaceable(entity);
		}
		
	}

	var onEntityRemoved = function (entity) {
		
		if (entity.hasComponents(CTile)) {
			removeTile(entity);
		} else if (entity.hasComponents(CTilePlaceable)) {
			unregisterPlaceable(entity);
		}
	}
	
	
	//
	// Private
	//
	var m_placeables = [];
}

ECS.EntityManager.registerSystem('GameWorld', GameWorld);
SystemsUtils.supplySubscriber(GameWorld);

//
// World utilities
//
GameWorld.prototype.getDistance = function (tile1, tile2) {
	
	// Distance formula at: http://www.mattpalmerlee.com/2012/04/10/creating-a-hex-grid-for-html5-games-in-javascript/
	
	var deltaRows = tile1.CTile.row - tile2.CTile.row;
	var deltaColumns = tile1.CTile.column - tile2.CTile.column;
	return ((Math.abs(deltaRows) + Math.abs(deltaColumns) + Math.abs(deltaRows - deltaColumns)) / 2);
}


// Find the lowest distance between groups of tiles.
GameWorld.prototype.getLowestDistance = function (tiles1, tiles2) {

	var lowestDist = Infinity;
	var dist;

	if (Utils.isArray(tiles1) && Utils.isArray(tiles2)) {

		for (var i = 0; i < tiles1.length; ++i) {
			for (var j = 0; j < tiles2.length; ++j) {
				dist = this.getDistance(tiles1[i], tiles2[j]);
				if (dist < lowestDist) {
					lowestDist = dist;
				}
			}
		}
	}

	// Swap and let the next check do the work.
	if (Utils.isArray(tiles1) && !Utils.isArray(tiles2)) {
		var swp = tiles2;
		tiles2 = tiles1;
		tiles1 = swp;
	}

	if (!Utils.isArray(tiles1) && Utils.isArray(tiles2)) {
		for (var j = 0; j < tiles2.length; ++j) {
			dist = this.getDistance(tiles1, tiles2[j]);
			if (dist < lowestDist) {
				lowestDist = dist;
			}
		}
	}

	if (!Utils.isArray(tiles1) && !Utils.isArray(tiles2))
		lowestDist = this.getDistance(tiles1, tiles2);

	return lowestDist;
}

// Returns all tiles that have the furthest same distance.
GameWorld.prototype.getFurthestTiles = function (tile, targetTiles) {

	var furthestDist = 0;
	var furthestTiles = [];
	var dist;

	for(var i = 0; i < targetTiles.length; ++i) {
		var targetTile = targetTiles[i];
		dist = this.getDistance(tile, targetTile);

		if (dist > furthestDist) {
			furthestDist = dist;
			furthestTiles.clear();
		} 
		
		if (dist == furthestDist) {
			furthestTiles.push(targetTile);
		}
	}

	return furthestTiles;
}


// Short-cut for creating unmanaged tile
GameWorld.createTileUnmanaged = function (terrainType, row, column) {
	
	Utils.assert(Enums.isValidValue(GameWorldTerrainType, terrainType));

	var tile = new ECS.Entity();
	tile.addComponent(CTile);
	tile.addComponent(CTileTerrain);
	tile.CTile.row = row;
	tile.CTile.column = column;
	tile.CTileTerrain.type = terrainType;

	return tile;
}