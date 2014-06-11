//===============================================
// GameStateSystem
// Takes care of the game state.
//===============================================
"use strict";

var TileBaseSystem = function () {
	var self = this;
	
	//
	// Entity system initialize
	//
	
	this.initialize = function () {
		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADING, onGameLoading);

		self._entityFilter.onEntityAddedHandler = registerBase;
		self._entityFilter.onEntityRemovedHandler = unregisterBase;

		m_bases = self._entityFilter.entities.slice(0);
	}

	//
	// ---- Private ----
	//

	var m_bases;
	var m_gameState;

	var onGameLoading = function (event) {
		m_gameState = self._eworld.extract(GameState);

		m_gameState.bases = m_bases.slice(0);
	}

	var registerBase = function (baseTile) {
		m_bases.push(baseTile);
		m_gameState.bases.push(baseTile);
	}

	var unregisterBase = function (baseTile) {
		m_bases.remove(baseTile);
		m_gameState.bases.remove(baseTile);
	}
};


TileBaseSystem.REQUIRED_COMPONENTS = [CTileTerrain, CTileOwner];
TileBaseSystem.isBaseTile = function (entity) {
	return entity.hasComponents(TileBaseSystem.REQUIRED_COMPONENTS) && entity.CTileTerrain.type == GameWorldTerrainType.Base;
}


ECS.EntityManager.registerSystem('TileBaseSystem', TileBaseSystem);
SystemsUtils.supplyComponentFilter(TileBaseSystem, TileBaseSystem.isBaseTile);