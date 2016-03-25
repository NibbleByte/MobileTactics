//===============================================
// TileVisibilitySystem
// Monitors which tiles are visible and which aren't.
//===============================================
"use strict";

var TileVisibilitySystem = function (m_world) {
	var self = this;

	var m_gameState = null;
	var m_playersData = null;
	var m_fogOfWarAllowed = true;

	//
	// Entity system initialize
	//

	this.initialize = function () {
		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADING, onGameLoading);
		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, refreshVisibility);
		self._eworldSB.subscribe(GameplayEvents.GameState.NO_PLAYING_PLAYERS, refreshVisibility);
		self._eworldSB.subscribe(EngineEvents.Placeables.PLACEABLE_MOVED, refreshVisibility);
		self._eworldSB.subscribe(EngineEvents.Placeables.PLACEABLE_UNREGISTERED, refreshVisibility);
		self._eworldSB.subscribe(EngineEvents.World.TILE_ADDED, onTileAdded);
		self._eworldSB.subscribe(EngineEvents.World.TILE_REMOVED, refreshVisibility);
		self._eworldSB.subscribe(GameplayEvents.Structures.OWNER_CHANGED, refreshVisibility);

		self._eworldSB.subscribe(GameplayEvents.Visibility.FORCE_VISIBILITY_REFRESH, refreshVisibility);

		m_world.iterateAllTiles(function(tile){
			onTileAdded(tile);
		});
	}

	var hideTile = function (tile) {
		tile.CTileVisibility.visible = false;
	}

	var showTile = function (tile) {
		tile.CTileVisibility.visible = true;
	}

	var showTiles = function (tiles) {
		for(var j = 0; j < tiles.length; ++j) {
			tiles[j].CTileVisibility.visible = true;
		}
	}

	var onGameLoading = function () {
		m_gameState = self._eworld.extract(GameState);
		m_playersData = self._eworld.extract(PlayersData);

		m_fogOfWarAllowed = m_gameState.fogOfWar;
	}

	var onTileAdded = function(tile) {
		tile.addComponent(CTileVisibility);

		tile.CTileVisibility.visible = !m_fogOfWarAllowed || m_gameState.hasGameFinished();

		if (self._eworld.blackboard[EngineBlackBoard.Serialization.IS_LOADING])
			return;

		if (m_gameState && m_gameState.currentPlayer)
			refreshVisibility();
	}

	var refreshVisibility = function () {


		if (m_fogOfWarAllowed && !m_gameState.hasGameFinished()) {

			m_world.iterateAllTiles(hideTile);

			if (m_gameState.currentPlayer == null)
				return;

			var visibleTiles = self.findPlayerVisibility(m_gameState.currentPlayer);

			showTiles(visibleTiles);
		}

		if (m_fogOfWarAllowed && m_gameState.hasGameFinished()) {
			m_world.iterateAllTiles(showTile);
		}
		

		// Populate visible placeables.
		for(var relation = 0; relation < m_gameState.visiblePlaceables.length; ++relation) {
			for(var i = 0; i < m_gameState.relationPlaceables[relation].length; ++i) {
				var placeable = m_gameState.relationPlaceables[relation][i];

				if (placeable.CTilePlaceable.tile.CTileVisibility.visible) {
					m_gameState.visiblePlaceables[relation].push(placeable);
				}
			}
		}


		self._eworld.trigger(GameplayEvents.Visibility.REFRESH_VISIBILITY);
		self._eworld.trigger(GameplayEvents.Visibility.REFRESH_VISIBILITY_AFTER);
	}

	this.findPlayerVisibility = function (player) {
		var foundTiles = [];

		// Placeables
		var placeables = m_world.getPlaceables();
		for (var i = 0; i < placeables.length; ++i) {
			var placeable = placeables[i];

			var relation = m_playersData.getRelation(placeable.CPlayerData.player, player);

			if (relation != PlayersData.Relation.Ally)
				continue;

			var tile = placeable.CTilePlaceable.tile;

			// If previewing some movement, use the preview tile instead of the current tile (avoid peek cheating).
			if (placeable.CUnit.actionsData.getTurnData(placeable.CUnit.turnPoints).executedActions.last() == Actions.Classes.ActionMove ||
				placeable.CUnit.actionsData.currentActionType == Actions.Classes.ActionMove	// Avoid problems during the ActionMove
				) {
				tile = placeable.CUnit.actionsData.getTurnData(placeable.CUnit.turnPoints).previewOriginalTile.last() || tile;
			}

			var visibleTiles = m_world.gatherTiles(tile, placeable.CStatistics.statistics['Visibility'], TileVisibilitySystem.visibilityCostQuery);
			visibleTiles.push(tile);

			foundTiles = foundTiles.concat(visibleTiles);
		}


		// Structures
		for (var i = 0; i < m_gameState.ownerableStructures.length; ++i) {
			var tile = m_gameState.ownerableStructures[i];

			if (!tile.CTileOwner.owner)
				continue;

			var relation = m_playersData.getRelation(tile.CTileOwner.owner, player);

			if (relation != PlayersData.Relation.Ally)
				continue;

			var visibleTiles = m_world.gatherTiles(tile, 1, TileVisibilitySystem.visibilityCostQuery);
			visibleTiles.push(tile);

			foundTiles = foundTiles.concat(visibleTiles);
		}

		return foundTiles;
	}
};

TileVisibilitySystem.visibilityCostQuery = function (tile, userData, queryResult) {
	queryResult.cost = 1;
	queryResult.passOver = true;
	queryResult.discard = false;
};

ECS.EntityManager.registerSystem('TileVisibilitySystem', TileVisibilitySystem);
SystemsUtils.supplySubscriber(TileVisibilitySystem);