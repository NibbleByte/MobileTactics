//===============================================
// ResourcesSystem
// Takes care of players resources (credits etc.)
// NOTE: This SHOULD not be an editor system.
//===============================================
"use strict";

var ResourcesSystem = function () {
	var self = this;
	var m_playersData = null;
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
		m_playersData = self._eworld.extract(PlayersData);
		m_gameState = self._eworld.extract(GameState);

		for(var i = 0; i < m_playersData.players.length; ++i) {

			// First timer - set credits, instead of earning them.
			// NOTE: this should not happen in editor.
			if (m_gameState.credits[m_playersData.players[i].playerId] === undefined) {
				m_gameState.credits[m_playersData.players[i].playerId] = m_gameState.startCredits;
			}
		}
	}
	
	var onTurnChanged = function (gameState, hasJustLoaded) {
		var player = m_gameState.currentPlayer;

		if (player == null)
			return;

		// hasJustLoaded - Turn has not actually passed, so no credits earning.
		// turnsPassed - First turn doesn't earn anything.
		if (m_gameState.currentStructuresTypes[GameWorldTerrainType.Base] && m_gameState.turnsPassed != 0 && !hasJustLoaded)
			var citiesCount = m_gameState.currentStructuresTypes[GameWorldTerrainType.Base].length;
		else
			var citiesCount = 0;

		var delta = m_gameState.creditsPerCity * citiesCount;
		m_gameState.credits[player.playerId] += delta;

		m_gameState.currentCredits = m_gameState.credits[player.playerId];

		self._eworld.trigger(GameplayEvents.Resources.CREDITS_CHANGED, m_gameState.currentCredits, delta);
	}

	var onAddCredits = function (player, value) {
		
		if (value == 0)
			return;

		m_gameState.credits[player.playerId] += value;
		
		if (m_gameState.currentPlayer == player) {
			m_gameState.currentCredits += value;
			self._eworld.trigger(GameplayEvents.Resources.CREDITS_CHANGED, m_gameState.currentCredits, value);
		}
	}
};

ECS.EntityManager.registerSystem('ResourcesSystem', ResourcesSystem);
SystemsUtils.supplySubscriber(ResourcesSystem);