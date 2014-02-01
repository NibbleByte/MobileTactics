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
	var m_eworld = null;
	var m_eworldSB = null;
	
	this.onAdded = function () {
		m_eworld = this.getEntityWorld();
		m_eworldSB = m_eworld.createSubscriber();
		
		m_eworldSB.subscribe(EngineEvents.General.GAME_LOADED, onGameLoaded);
		m_eworldSB.subscribe(GameplayEvents.GameState.END_TURN, onEndTurn);
		m_eworldSB.subscribe(GameplayEvents.Players.PLAYER_REMOVED, onPlayerRemoved);
		m_eworldSB.subscribe(GameplayEvents.Players.PLAYER_STOPPED_PLAYING, onPlayerRemoved);
	}
	
	this.onRemoved = function () {
		m_eworldSB.unsubscribeAll();
		m_eworldSB = null;
		m_eworld = null;
	}
	
	var onGameLoaded = function (event) {
		m_playersData = m_eworld.extract(PlayersData);
		m_gameState = m_eworld.extract(GameState);
		
		if (m_gameState.currentPlayer == null)
			m_gameState.currentPlayer = m_playersData.getFirstPlayingPlayer();
		
		if (m_gameState.currentPlayer != null) {
			m_eworld.trigger(GameplayEvents.GameState.TURN_CHANGED, m_gameState.currentPlayer);
		} else {
			m_eworld.trigger(GameplayEvents.GameState.NO_PLAYING_PLAYERS);
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
			m_eworld.trigger(GameplayEvents.GameState.NO_PLAYING_PLAYERS);
			return;
		}
		
		if (previousPlayer != null && previousPlayer.id > m_gameState.currentPlayer.id) {
			++m_gameState.turnsPassed;
		}
		
		m_eworld.trigger(GameplayEvents.GameState.TURN_CHANGED, m_gameState.currentPlayer);
	}
	
	var onPlayerRemoved = function (event, player) {
		if (player == m_gameState.currentPlayer) {
			m_eworld.trigger(GameplayEvents.GameState.END_TURN);
		}
	}
};

ECS.EntityManager.registerSystem('GameStateSystem', GameStateSystem);