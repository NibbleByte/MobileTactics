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
					
					if (open.indexOf(tile) == -1) {
						open.push(tile);
					}
				}
				
				tile.__$discard = queryResult.discard;
			}
			
			
			if (visited.indexOf(openTile) == -1) {
				
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
	
	
	var addTile = function (tile) {		
		var row = tile.CTile.row;
		var column = tile.CTile.column;
		
		console.assert(row >= 0);
		console.assert(column >= 0);
		
		if (m_tiles[row] == undefined)
			m_tiles[row] = [];
		
		m_tiles[row][column] = tile;
		
		self._eworld.trigger(EngineEvents.World.TILE_ADDED, tile);
		
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
		
		self._eworld.trigger(EngineEvents.Placeables.PLACEABLE_MOVED, placeable);
	};
	
	this.getPlaceablesInArea = function (tileCenter, radius, excludePlaceable) {
		var placeables = [];
		
		for(var i = 0; i < m_placeables.length; ++i) {
			var placeable = m_placeables[i];
			
			if (self.getDistance(tileCenter, placeable.CTilePlaceable.tile) <= radius && placeable != excludePlaceable) {
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
	
	
	
	var onEntityAdded = function (event, entity) {
		
		if (entity.hasComponents(CTile)) {
			addTile(entity);
		} else if (entity.hasComponents(CTilePlaceable)) {
			registerPlaceable(entity);
		}
		
	}

	var onEntityRemoved = function (event, entity) {
		
		if (entity.hasComponents(CTile)) {
			removeTile(entity);
		} else if (entity.hasComponents(CTilePlaceable)) {
			unregisterPlaceable(entity);
		}

		Utils.invalidate(entity);
	}
	
	
	//
	// Private
	//
	var m_placeables = [];
}

ECS.EntityManager.registerSystem('GameWorld', GameWorld);
SystemsUtils.supplySubscriber(GameWorld);
GameWorld.BLACKBOARD_NAME = 'GameWorld';

GameWorld.prototype.getDistance = function (tile1, tile2) {
	
	// Distance formula at: http://www.mattpalmerlee.com/2012/04/10/creating-a-hex-grid-for-html5-games-in-javascript/
	
	var deltaRows = tile1.CTile.row - tile2.CTile.row;
	var deltaColumns = tile1.CTile.column - tile2.CTile.column;
	return ((Math.abs(deltaRows) + Math.abs(deltaColumns) + Math.abs(deltaRows - deltaColumns)) / 2);
}
