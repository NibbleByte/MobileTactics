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
	var m_eworld = null;
	var m_eworldSB = null;
	
	//
	// Entity system initialize
	//
	this.onAdded = function () {
		m_eworld = this.getEntityWorld();
		m_eworldSB = m_eworld.createSubscriber();
		
		m_eworldSB.subscribe(ECS.EntityWorld.Events.ENTITY_REMOVED, onEntityRemoved);
	}
	
	this.onRemoved = function () {
		m_eworldSB.unsubscribeAll();
		m_eworldSB = null;
		m_eworld = null;
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
	
	
	this.loadTiles = function(tiles) {
		for(var i = 0; i < tiles.length; ++i) {
			self.addTile(tiles[i]);
		}
	}
	
	this.clearTiles = function() {
		for(var i = 0; i < m_rows; ++i) {
			for(var j = 0; j < m_columns; ++j) {
				var tile = self.getTile(i, j);
				
				if (tile) {
					m_eworld.trigger(EngineEvents.World.TILE_REMOVED, tile);
					
					tile.destroy();
				}
			}
		}
		
		
		
		m_rows = 0;
		m_columns = 0;
		m_tiles = [];
		
		m_eworld.trigger(EngineEvents.World.SIZE_CHANGED, {
			rows: m_rows,
			columns: m_columns,
		});
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
	
	
	this.addTile = function (tile) {		
		var row = tile.CTile.row;
		var column = tile.CTile.column;
		
		console.assert(row >= 0);
		console.assert(column >= 0);
		
		if (m_tiles[row] == undefined)
			m_tiles[row] = [];
		
		m_tiles[row][column] = tile;
		
		m_eworld.trigger(EngineEvents.World.TILE_ADDED, tile);
		
		// Resize grid
		var resized = false;
		if (m_rows - 1 < row) {
			m_rows = row + 1;
			resized = true;
		}
		if (m_columns - 1 < column) {
			m_columns = column + 1;
			resized = true;
		}
		
		if (resized) {
			m_eworld.trigger(EngineEvents.World.SIZE_CHANGED, {
				rows: m_rows,
				columns: m_columns,
			});
		}
	}
	
	this.removeTile = function (tile) {
		
		m_eworld.trigger(EngineEvents.World.TILE_REMOVED, tile);
		
		// Remove placeables if has any.
		for(var i = 0; i < tile.CTile.placedObjects.length; ++i) {
			tile.CTile.placedObjects[i].destroy();
		}
		
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
	}
	
		
	//
	// Placed objects handling
	//
	this.registerPlaceableAt = function (placeable, tile) {
		
		m_placeables.push(placeable);
		
		m_eworld.trigger(EngineEvents.Placeables.PLACEABLE_REGISTERED, placeable);
		
		self.place(placeable, tile);
	}
	
	var unregisterPlaceable = function (placeable) {
		
		var foundIndex = m_placeables.indexOf(placeable);
		
		if (foundIndex == -1)
			return false;
		
		m_eworld.trigger(EngineEvents.Placeables.PLACEABLE_UNREGISTERED, placeable);
		
		placeable.CTilePlaceable.tile.CTile.removeObject(placeable);
		m_placeables.splice(foundIndex, 1);
		
		return true;
	}
	
	this.place = function (placeable, tile) {
		// Detach from previous tile
		var oldTile = placeable.CTilePlaceable.tile;
		if (oldTile) {
			oldTile.CTile.removeObject(placeable);
		}
		
		placeable.CTilePlaceable.tile = tile;
		tile.CTile.placedObjects.push(placeable);
		
		m_eworld.trigger(EngineEvents.Placeables.PLACEABLE_MOVED, placeable);
	};
	
	this.getAllPlaceables = function () {
		return m_placeables;
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
	

	var onEntityRemoved = function (event, entity) {
		
		if (entity.hasComponents(CTilePlaceable)) {
			unregisterPlaceable(entity);
		}
	}
	
	
	//
	// Private
	//
	var m_placeables = [];
}

ECS.EntityManager.registerSystem('GameWorld', GameWorld);

GameWorld.prototype.getDistance = function (tile1, tile2) {
	
	// Distance formula at: http://www.mattpalmerlee.com/2012/04/10/creating-a-hex-grid-for-html5-games-in-javascript/
	
	var deltaRows = tile1.CTile.row - tile2.CTile.row; 
	var deltaColumns = tile1.CTile.column - tile2.CTile.column;
	return ((Math.abs(deltaRows) + Math.abs(deltaColumns) + Math.abs(deltaRows - deltaColumns)) / 2);
}
