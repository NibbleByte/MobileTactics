//===============================================
// TileVisibilitySystem
// Monitors which tiles are visible and which aren't.
//===============================================
"use strict";

var TileVisibilitySystem = function (m_world) {
	var self = this;

	var m_gameState = null;

	//
	// Entity system initialize
	//

	this.initialize = function () {
		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADING, onGameLoading);
		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, refreshVisibility);
		self._eworldSB.subscribe(GameplayEvents.GameState.NO_PLAYING_PLAYERS, refreshVisibility);
		self._eworldSB.subscribe(EngineEvents.Placeables.PLACEABLE_MOVED, refreshVisibility);
		self._eworldSB.subscribe(EngineEvents.Placeables.PLACEABLE_UNREGISTERED, refreshVisibility);
		self._eworldSB.subscribe(EngineEvents.World.TILE_REMOVED, refreshVisibility);
		self._eworldSB.subscribe(GameplayEvents.Structures.CAPTURE_FINISHED, refreshVisibility);

		self._eworldSB.subscribe(EngineEvents.World.TILE_ADDED, onTileAdded);
		m_world.iterateAllTiles(function(tile){
			onTileAdded(null, tile);
		});
	}

	var hideTile = function (tile) {
		tile.CTileVisibility.visible = false;
	}

	var showTiles = function (tiles) {
		for(var j = 0; j < tiles.length; ++j) {
			tiles[j].CTileVisibility.visible = true;
		}
	}

	var onGameLoading = function (event) {
		m_gameState = self._eworld.extract(GameState);
	}

	var onTileAdded = function(event, tile) {
		tile.addComponent(CTileVisibility);
	}

	var refreshVisibility = function () {
		m_world.iterateAllTiles(hideTile);

		// Placeables
		for (var i = 0; i < m_gameState.relationPlaceables[PlayersData.Relation.Ally].length; ++i) {
			var placeable = m_gameState.relationPlaceables[PlayersData.Relation.Ally][i];
			
			// If previewing some movement, use the preview tile instead of the current tile (avoid peek cheating).
			var tile = placeable.CUnit.actionsData.previewOriginalTile || placeable.CTilePlaceable.tile;

			var visibleTiles = m_world.gatherTiles(tile, placeable.CStatistics.statistics['Visibility'], visibilityCostQuery);
			visibleTiles.push(tile);

			showTiles(visibleTiles);
		}

		// Structures
		for (var i = 0; i < m_gameState.relationStructures[PlayersData.Relation.Ally].length; ++i) {
			var tile = m_gameState.relationStructures[PlayersData.Relation.Ally][i];

			var visibleTiles = m_world.gatherTiles(tile, 1, visibilityCostQuery);
			visibleTiles.push(tile);

			showTiles(visibleTiles);
		}

		self._eworld.trigger(GameplayEvents.Fog.REFRESH_FOG);
		self._eworld.trigger(GameplayEvents.Fog.REFRESH_FOG_AFTER);
	}

	var visibilityCostQuery = function (tile) {
		return {
			cost: 1,
			passOver: true,
			discard: false,
		};
	}
};

ECS.EntityManager.registerSystem('TileVisibilitySystem', TileVisibilitySystem);
SystemsUtils.supplySubscriber(TileVisibilitySystem);