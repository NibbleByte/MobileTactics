//===============================================
// TileCapturingSystem
// Takes care of the capturing mechanics.
//===============================================
"use strict";

var TileCapturingSystem = function () {
	var self = this;
	
	//
	// Entity system initialize
	//
	
	this.initialize = function () {
		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADING, onGameLoading);
		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADED, onGameLoaded);
		self._eworldSB.subscribe(GameplayEvents.Structures.CAPTURE_STARTED, onCaptureStarted);
		self._eworldSB.subscribe(GameplayEvents.Structures.CAPTURE_STOPPED, onCaptureStopped);
		self._eworldSB.subscribe(GameplayEvents.Structures.CAPTURE_INTERUPTED, onCaptureStopped);
		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, onTurnChanged);
		self._eworldSB.subscribe(GameplayEvents.Units.UNIT_DESTROYING, onUnitDestroying);
		self._eworldSB.subscribe(GameplayEvents.Units.UNIT_DESTROYING_UNDO, onUnitDestroyingUndo);
	}

	//
	// ---- Private ----
	//

	var m_gameState = null;
	var m_playersData = null;
	var m_capturingTiles = [];

	var onGameLoading = function () {
		m_gameState = self._eworld.extract(GameState);
		m_playersData = self._eworld.extract(PlayersData);
	}

	var onGameLoaded = function () {
		m_capturingTiles = [];

		var entities = self._entityFilter.entities;

		for(var i = 0; i < entities.length; ++i) {
			if (entities[i].CTileOwner && entities[i].CTileOwner.beingCapturedBy != null) {
				m_capturingTiles.push(entities[i]);
			}
		}
	}

	var onCaptureStarted = function (tile) {
		m_capturingTiles.push(tile);
	}

	var onCaptureStopped = function (tile) {
		m_capturingTiles.remove(tile);
	}

	var onTurnChanged = function (gameState, hasJustLoaded) {
		
		// Turn has not actually passed, so capture state should remain the same.
		if (hasJustLoaded)
			return;

		var player = m_gameState.currentPlayer;

		for(var i = 0; i < m_capturingTiles.length; ++i) {
			var tile = m_capturingTiles[i]

			if (tile.CTileOwner.beingCapturedBy.CPlayerData.player == player) {
				tile.CTileOwner.captureTurns--;

				// Do capture
				if (tile.CTileOwner.captureTurns == 0) {
					var prevOwner = tile.CTileOwner.owner;

					// Remove from previous relation.
					var relation = PlayersData.Relation.Neutral;
					if (prevOwner) {
						relation = m_playersData.getRelation(prevOwner, player);

						// The x owner knows who took it from him!
						tile.CTileOwner.knowledge[prevOwner.playerId] = player;
					}
					m_gameState.relationStructures[relation].remove(tile);

					// Change ownership
					tile.CTileOwner.owner = player;
					tile.CTileOwner.beingCapturedBy.destroy();
					tile.CTileOwner.beingCapturedBy = null;
					tile.CTileOwner.knowledge[player.playerId] = player;
					m_capturingTiles.remove(tile);
					--i;

					// Set up game state structures
					m_gameState.currentStructures.push(tile);
					m_gameState.currentStructuresTypes[tile.CTileTerrain.type].push(tile);
					m_gameState.relationStructures[PlayersData.Relation.Ally].push(tile);

					// Notify
					self._eworld.trigger(GameplayEvents.Structures.OWNER_CHANGED, tile, prevOwner);
					self._eworld.trigger(GameplayEvents.Structures.CAPTURE_FINISHED, tile, prevOwner);
				}
			}
		}
	}

	var onUnitDestroying = function (unit) {
		var tile = unit.CTilePlaceable.tile;
		if (tile.CTileOwner && tile.CTileOwner.beingCapturedBy == unit) {

			// Prepare undo data
			var action = self._eworld.blackboard[GameplayBlackBoard.Actions.CURRENT_ACTION];
			if (action) {
				action.undoData.capturingData = action.undoData.capturingData || [];
				action.undoData.capturingData.push({
					entity: unit,
					captureTurns: tile.CTileOwner.captureTurns,
				});
			}


			// Remove capturing
			tile.CTileOwner.beingCapturedBy = null;
			tile.CTileOwner.captureTurns = 0;

			self._eworld.trigger(GameplayEvents.Structures.CAPTURE_INTERUPTED, tile);
		}
	}

	var onUnitDestroyingUndo = function (unit) {
		var tile = unit.CTilePlaceable.tile;

		// Prepare undo data
		var action = self._eworld.blackboard[GameplayBlackBoard.Actions.CURRENT_ACTION];
		if (action && action.undoData.capturingData) {
			for(var i = 0; i < action.undoData.capturingData.length; ++i) {
				var capturingData = action.undoData.capturingData[i];
				if (capturingData.entity == unit) {
					tile.CTileOwner.beingCapturedBy = unit;
					tile.CTileOwner.captureTurns = capturingData.captureTurns;

					self._eworld.trigger(GameplayEvents.Structures.CAPTURE_STARTED, tile);

					break;
				}
			}
		}
	}
};

TileCapturingSystem.isOwnerableTile = function (terrainType) {
	return terrainType == GameWorldTerrainType.Base
		|| terrainType == GameWorldTerrainType.HQ
		|| terrainType == GameWorldTerrainType.Factory
		|| terrainType == GameWorldTerrainType.Minerals
		|| terrainType == GameWorldTerrainType.Harbour
		|| terrainType == GameWorldTerrainType.WatchTower;
}

ECS.EntityManager.registerSystem('TileCapturingSystem', TileCapturingSystem);
SystemsUtils.supplyComponentFilter(TileCapturingSystem, [CTileOwner]);