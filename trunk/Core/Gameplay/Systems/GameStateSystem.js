//===============================================
// GameStateSystem
// Takes care of the game state.
//===============================================
"use strict";

var GameStateSystem = function () {
	var self = this;
	var m_playersData = null;
	var m_gameState = null;
	
	//
	// Entity system initialize
	//
	
	this.initialize = function () {
		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADED, onGameLoaded);
		self._eworldSB.subscribe(GameplayEvents.GameState.END_TURN, onEndTurn);
		self._eworldSB.subscribe(GameplayEvents.Players.PLAYER_REMOVED, onPlayerRemoved);
		self._eworldSB.subscribe(GameplayEvents.Players.PLAYER_STOPPED_PLAYING, onPlayerRemoved);
	}
	
	var onGameLoaded = function (event) {
		m_playersData = self._eworld.extract(PlayersData);
		m_gameState = self._eworld.extract(GameState);
		
		if (m_gameState.currentPlayer == null)
			m_gameState.currentPlayer = m_playersData.getFirstPlayingPlayer();
		
		if (m_gameState.currentPlayer != null) {
			self._eworld.trigger(GameplayEvents.GameState.TURN_CHANGED, m_gameState.currentPlayer);
		} else {
			self._eworld.trigger(GameplayEvents.GameState.NO_PLAYING_PLAYERS);
		}
	}
	
	var onEndTurn = function (event) {
		var previousPlayer = m_gameState.currentPlayer;
		
		if (m_gameState.currentPlayer != null) {
			m_gameState.currentPlayer = m_playersData.getNextPlayingPlayer(m_gameState.currentPlayer);
		} else {
			m_gameState.currentPlayer = m_playersData.getFirstPlayingPlayer();
		}
		
		// If had no current player and still have none, do nothing.
		if (m_gameState.currentPlayer == null) {
			self._eworld.trigger(GameplayEvents.GameState.NO_PLAYING_PLAYERS);
			return;
		}
		
		if (previousPlayer != null && previousPlayer.id > m_gameState.currentPlayer.id) {
			++m_gameState.turnsPassed;
		}
		
		self._eworld.trigger(GameplayEvents.GameState.TURN_CHANGED, m_gameState.currentPlayer);
	}
	
	var onPlayerRemoved = function (event, player) {
		if (player == m_gameState.currentPlayer) {
			self._eworld.trigger(GameplayEvents.GameState.END_TURN);
		}
	}
};

ECS.EntityManager.registerSystem('GameStateSystem', GameStateSystem);
SystemsUtils.supplySubscriber(GameStateSystem);