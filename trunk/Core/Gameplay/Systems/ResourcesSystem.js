//===============================================
// ResourcesSystem
// Takes care of players resources (credits etc.)
// NOTE: This SHOULD not be an editor system.
//===============================================
"use strict";

var ResourcesSystem = function () {
	var self = this;
	var m_gameState = null;
	
	//
	// Entity system initialize
	//
	
	this.initialize = function () {
		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADING, onGameLoading);
		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, onTurnChanged);

		self._eworldSB.subscribe(GameplayEvents.Resources.ADD_CREDITS, onAddCredits);
	}
	
	var onGameLoading = function () {
		m_gameState = self._eworld.extract(GameState);
	}
	
	var onTurnChanged = function (gameState, hasJustLoaded) {
		var player = m_gameState.currentPlayer;

		if (player == null)
			return;

		// hasJustLoaded - Turn has not actually passed, so no credits earning.
		// turnsPassed - First turn doesn't earn anything.
		var incomeCount = 0;
		if (m_gameState.turnsPassed != 0 && !hasJustLoaded) {

			incomeCount += m_gameState.currentStructuresTypes[GameWorldTerrainType.Base].length;
			incomeCount += m_gameState.currentStructuresTypes[GameWorldTerrainType.Minerals].length;
		}

		var delta = player.creditsPerIncome * incomeCount;
		player.credits += delta;

		self._eworld.trigger(GameplayEvents.Resources.CURRENT_CREDITS_CHANGED, player.credits, delta);
	}

	var onAddCredits = function (player, delta) {
		
		if (delta == 0)
			return;

		player.credits += delta;
		
		if (m_gameState.currentPlayer == player) {
			self._eworld.trigger(GameplayEvents.Resources.CURRENT_CREDITS_CHANGED, player.credits, delta);
		}
	}
};

ECS.EntityManager.registerSystem('ResourcesSystem', ResourcesSystem);
SystemsUtils.supplySubscriber(ResourcesSystem);