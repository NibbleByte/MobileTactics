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
		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, onTurnChanged);
		self._eworldSB.subscribe(GameplayEvents.Units.UNIT_DESTROYING, onUnitDestroying);

		self._eworldSB.subscribe(EngineEvents.World.TILE_ADDED, onTileAdded);
		self._eworldSB.subscribe(EngineEvents.World.TILE_REMOVING, onTileRemoving);
	}

	//
	// ---- Private ----
	//

	var m_gameState = null;
	var m_playersData = null;
	var m_capturingTiles = [];

	var onGameLoading = function (event) {
		m_gameState = self._eworld.extract(GameState);
		m_playersData = self._eworld.extract(PlayersData);
	}

	var onGameLoaded = function (event) {
		m_capturingTiles = [];

		var entities = self._entityFilter.entities;

		for(var i = 0; i < entities.length; ++i) {
			if (entities[i].CTileOwner && entities[i].CTileOwner.beingCapturedBy != null) {
				m_capturingTiles.push(entities[i]);
			}
		}
	}

	var onCaptureStarted = function (event, tile) {
		m_capturingTiles.push(tile);
	}

	var onTurnChanged = function (event, gameState, hasJustLoaded) {
		m_gameState.clearStructures();

		var player = m_gameState.currentPlayer;

		var entities = self._entityFilter.entities;
		for (var i = 0; i < entities.length; ++i) {
			var tile = entities[i];

			if (tile.CTileOwner.owner == player) {
				m_gameState.currentStructures.push(tile);
			}

			var relation = PlayersData.Relation.Neutral;
			if (tile.CTileOwner.owner != null) {
				relation = m_playersData.getRelation(tile.CTileOwner.owner, player);
			}
			m_gameState.relationStructures[relation].push(tile);
		}

		// Turn has not actually passed, so capture state should remain the same.
		if (hasJustLoaded)
			return;

		for(var i = 0; i < m_capturingTiles.length; ++i) {
			var tile = m_capturingTiles[i]

			if (tile.CTileOwner.beingCapturedBy.CPlayerData.player == player) {
				tile.CTileOwner.captureTurns--;

				// Do capture
				if (tile.CTileOwner.captureTurns == 0) {

					// Remove from previous relation.
					var relation = PlayersData.Relation.Neutral;
					if (tile.CTileOwner.owner != null) {
						relation = m_playersData.getRelation(tile.CTileOwner.owner, player);
					}
					m_gameState.relationStructures[relation].remove(tile);

					// Change ownership
					tile.CTileOwner.owner = player;
					tile.CTileOwner.beingCapturedBy.destroy();
					tile.CTileOwner.beingCapturedBy = null;
					m_capturingTiles.remove(tile);
					--i;

					// Set up game state structures
					m_gameState.currentStructures.push(tile);
					m_gameState.relationStructures[PlayersData.Relation.Ally].push(tile);

					// Notify
					self._eworld.trigger(GameplayEvents.Structures.CAPTURE_FINISHED, tile);
				}
			}
		}
	}

	var onUnitDestroying = function (event, unit) {
		var tile = unit.CTilePlaceable.tile;
		if (tile.CTileOwner && tile.CTileOwner.beingCapturedBy == unit) {
			tile.CTileOwner.beingCapturedBy = null;
			tile.CTileOwner.captureTurns = 0;
			m_capturingTiles.remove(tile);

			self._eworld.trigger(GameplayEvents.Structures.CAPTURE_INTERUPTED, tile);
		}
	}

	var onTileAdded = function (event, tile) {
		if (!tile.CTileOwner || m_gameState == null || m_gameState.currentPlayer == null)
			return;

		if (tile.CTileOwner.owner == m_gameState.currentPlayer) {
			m_gameState.currentStructures.push(tile);
		}

		var relation = PlayersData.Relation.Neutral;
		if (tile.CTileOwner.owner != null) {
			relation = m_playersData.getRelation(tile.CTileOwner.owner, m_gameState.currentPlayer);
		}
		m_gameState.relationStructures[relation].push(tile);
	}

	var onTileRemoving = function (event, tile) {
		if (!tile.CTileOwner || m_gameState == null || m_gameState.currentPlayer == null)
			return;

		// Remove from game state.
		m_gameState.currentStructures.remove(tile);

		for (var i = 0; i < m_gameState.relationStructures.length; ++i) {
			m_gameState.relationStructures[i].remove(tile);
		}
	}
};


ECS.EntityManager.registerSystem('TileCapturingSystem', TileCapturingSystem);
SystemsUtils.supplyComponentFilter(TileCapturingSystem, [CTileOwner]);