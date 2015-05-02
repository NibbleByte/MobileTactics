//===============================================
// TileStructuresSystem
// Takes care of the gameState structures data.
//===============================================
"use strict";

var TileStructuresSystem = function () {
	var self = this;
	
	//
	// Entity system initialize
	//
	
	this.initialize = function () {
		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADING, onGameLoading);

		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, onTurnChanged);
		self._eworldSB.subscribe(GameplayEvents.Fog.REFRESH_FOG, onFogRefresh);

		self._eworldSB.subscribe(EngineEvents.World.TILE_ADDED, onTileAdded);
		self._eworldSB.subscribe(EngineEvents.World.TILE_REMOVING, onTileRemoving);
	}

	//
	// ---- Private ----
	//

	var m_gameState = null;
	var m_playersData = null;

	

	var onGameLoading = function (event) {
		m_gameState = self._eworld.extract(GameState);
		m_playersData = self._eworld.extract(PlayersData);

		//
		// Bases
		//
		m_gameState.bases = [];
		var entities = self._entityFilter.entities;
		for(var i = 0; i < entities.length; ++i) {
			onTileAdded(null, entities[i]);
		}
	}

	var onTurnChanged = function (event, gameState, hasJustLoaded) {
		m_gameState.clearStructures();

		var player = m_gameState.currentPlayer;

		if (player == null)
			return;

		var entities = self._entityFilter.entities;
		for (var i = 0; i < entities.length; ++i) {
			var tile = entities[i];

			if (tile.CTileOwner.owner == player) {
				m_gameState.currentStructures.push(tile);
			}

			var relation = PlayersData.Relation.Neutral;
			if (tile.CTileOwner.owner) {
				relation = m_playersData.getRelation(tile.CTileOwner.owner, player);
			}

			m_gameState.relationStructures[relation].push(tile);
		}
	}

	var onFogRefresh = function (event) {

		var player = m_gameState.currentPlayer;

		if (!player)
			return;

		// Populate known structures.
		for (var i = 0; i < m_gameState.structures.length; ++i) {
			var tile = m_gameState.structures[i];

			// Apply visibility to knowledge.
			if (tile.CTileVisibility.visible) {
				tile.CTileOwner.knowledge[player.playerId] = tile.CTileOwner.owner;
			}

			var relation = PlayersData.Relation.Neutral;
			if (tile.CTileOwner.knowledge[player.playerId]) {
				relation = m_playersData.getRelation(tile.CTileOwner.knowledge[player.playerId], player);
			}

			m_gameState.knownStructures[relation].push(tile);
		}
	}

	var onTileAdded = function (event, tile) {
		
		if (!tile.CTileOwner || m_gameState == null)
			return;

		//
		// Common
		//
		m_gameState.structures.push(tile);

		if (TileStructuresSystem.isBaseTile(tile)) {
			m_gameState.bases.push(tile);
		}


		//
		// Relations
		//
		if (m_gameState.currentPlayer == null)
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
		
		if (!tile.CTileOwner || m_gameState == null)
			return;
		//
		// Common
		//
		m_gameState.structures.remove(tile);

		if (TileStructuresSystem.isBaseTile(tile)) {
			m_gameState.bases.remove(tile);
		}


		//
		// Relations
		//
		if (m_gameState.currentPlayer == null)
			return;

		// Remove from game state.
		m_gameState.currentStructures.remove(tile);

		for (var i = 0; i < m_gameState.relationStructures.length; ++i) {
			m_gameState.relationStructures[i].remove(tile);
		}
	}
};


TileStructuresSystem.REQUIRED_COMPONENTS = [CTileTerrain, CTileOwner];
TileStructuresSystem.isBaseTile = function (entity) {
	return entity.hasComponents(TileStructuresSystem.REQUIRED_COMPONENTS) && entity.CTileTerrain.type == GameWorldTerrainType.Base;
}


ECS.EntityManager.registerSystem('TileStructuresSystem', TileStructuresSystem);
SystemsUtils.supplyComponentFilter(TileStructuresSystem, TileStructuresSystem.REQUIRED_COMPONENTS);