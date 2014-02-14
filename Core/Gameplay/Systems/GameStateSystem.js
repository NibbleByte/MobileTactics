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
		self._eworldSB.subscribe(EngineEvents.Placeables.PLACEABLE_REGISTERED, onAppendPlaceable);
		self._eworldSB.subscribe(EngineEvents.Placeables.PLACEABLE_UNREGISTERED, onRemovePlaceable);
		
		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADED, onGameLoaded);
		self._eworldSB.subscribe(GameplayEvents.GameState.END_TURN, onEndTurn);
		self._eworldSB.subscribe(GameplayEvents.Players.PLAYER_REMOVED, onPlayerRemoved);
		self._eworldSB.subscribe(GameplayEvents.Players.PLAYER_STOPPED_PLAYING, onPlayerRemoved);
	}
	
	var onRemovePlaceable = function (event, placeable) {
		if (placeable.CPlayerData) {
			
			if (placeable.CPlayerData.player == m_gameState.currentPlayer) {
				m_gameState.currentPlaceables.remove(placeable);
			}
			
			var relation = m_playersData.getRelation(placeable.CPlayerData.player, m_gameState.currentPlayer);
			m_gameState.relationPlaceables[relation].remove(placeable);
		}
	}
	
	var onAppendPlaceable = function (event, placeable) {
		if (placeable.CPlayerData) {
			
			if (placeable.CPlayerData.player == m_gameState.currentPlayer) {
				m_gameState.currentPlaceables.push(placeable);
			}
			
			var relation = m_playersData.getRelation(placeable.CPlayerData.player, m_gameState.currentPlayer);
			m_gameState.relationPlaceables[relation].push(placeable);
		}
	}
	
	var populateGameStateUnits = function () {
		m_gameState.clearPlaceables();
		
		var placeables = self._entityFilter.entities;
		
		for(var i = 0; i < placeables.length; ++i) {
			var placeable = placeables[i];
			
			onAppendPlaceable(null, placeable);
		}
	}
	
	var onGameLoaded = function (event) {
		m_playersData = self._eworld.extract(PlayersData);
		m_gameState = self._eworld.extract(GameState);
		
		if (m_gameState.currentPlayer == null)
			m_gameState.currentPlayer = m_playersData.getFirstPlayingPlayer();
		
		if (m_gameState.currentPlayer != null) {
			populateGameStateUnits();
			
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
		
		
		populateGameStateUnits();
		
		self._eworld.trigger(GameplayEvents.GameState.TURN_CHANGED, m_gameState.currentPlayer);
	}
	
	var onPlayerRemoved = function (event, player) {
		if (player == m_gameState.currentPlayer) {
			self._eworld.trigger(GameplayEvents.GameState.END_TURN);
		}
	}
};

ECS.EntityManager.registerSystem('GameStateSystem', GameStateSystem);
SystemsUtils.supplyComponentFilter(GameStateSystem, [CTilePlaceable]);