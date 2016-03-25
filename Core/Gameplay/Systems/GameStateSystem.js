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
		self._eworldSB.subscribe(EngineEvents.Placeables.PLACEABLE_UNREGISTERING, onRemovePlaceable);
		
		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADING, onGameLoading);
		self._eworldSB.subscribe(EngineEvents.General.GAME_VALIDATE, onGameValidation);
		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADED, onGameLoaded);
		self._eworldSB.subscribe(GameplayEvents.GameState.START_GAME, onStartGame);
		self._eworldSB.subscribe(GameplayEvents.GameState.END_TURN, onEndTurn);
		self._eworldSB.subscribe(GameplayEvents.GameState.PLAYER_DEFEATED, onPlayerDefeated);
		self._eworldSB.subscribe(GameplayEvents.GameState.PLAYERS_VICTORIOUS, onPlayersVictorious);
		self._eworldSB.subscribe(GameplayEvents.Players.PLAYER_REMOVED, onPlayerRemoved);
		self._eworldSB.subscribe(GameplayEvents.Players.IS_PLAYING_CHANGED, onIsPlayingChanged);
	}
	
	var onRemovePlaceable = function (placeable) {
		if (placeable.CPlayerData && m_gameState.currentPlayer) {
			
			if (placeable.CPlayerData.player == m_gameState.currentPlayer) {
				m_gameState.currentPlaceables.remove(placeable);
			}

			var relation = m_playersData.getRelation(placeable.CPlayerData.player, m_gameState.currentPlayer);
			m_gameState.relationPlaceables[relation].remove(placeable);
		}
	}
	
	var onAppendPlaceable = function (placeable) {
		
		// currentPlayer can be null, if game is still loading for the first time.
		if (placeable.CPlayerData && m_gameState.currentPlayer) {
			
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
			
			onAppendPlaceable(placeable);
		}
	}

	var canView = function (player) {
		return player.type == Player.Types.Human;
	}
	
	var onGameLoading = function () {
		m_playersData = self._eworld.extract(PlayersData);
		m_gameState = self._eworld.extract(GameState);
	}

	var onGameValidation = function (failReasons) {

		// TODO: Editor doesn't do these checks on load up, because this system is not present there.
		if (m_gameState.gameStarted)
			return;
		
		if (!m_gameState.isCustomMap) {
			var entities = self._eworld.getEntities();

			for (var i = 0; i < entities.length; ++i) {
				var entity = entities[i];

				if (entity.CUnit && !GenericUnits.contains(entity.CUnit.getDefinition())) {
					failReasons.push('Generic maps is not allowed to have any units except generic ones. Found unit: ' + entity.CUnit.name);
				}
			}
		}
	}

	var onStartGame = function () {

		// Remove any non-playing players units.
		var placeables = self._entityFilter.entities.clone();
		
		for (var i = 0; i < placeables.length; ++i) {
			var placeable = placeables[i];
			var player = placeable.CPlayerData.player;
			var tile = placeable.CTilePlaceable.tile;

			if (!placeable.CPlayerData.player.isPlaying) {
				placeable.destroy();

			} else if (!m_gameState.isCustomMap && placeable.CUnit.race != player.race) {
				placeable.destroy();

				placeable = UnitsFactory.createUnit(GenericUnits.getDefinitionByRace(player.race), player);
				self._eworld.addUnmanagedEntity(placeable);
				self._eworld.extract(GameWorld).place(placeable, tile);
			}
		}

		var structures = m_gameState.ownerableStructures;
		for(var i = 0; i < structures.length; ++i) {
			var tile = structures[i];

			if (tile.CTileOwner.owner && !tile.CTileOwner.owner.isPlaying) {
				tile.CTileOwner.owner = null;
				self._eworld.trigger(GameplayEvents.Structures.OWNER_CHANGED, tile);
			}
		}


		m_gameState.gameStarted = true;

		onGameLoaded();
	}

	var onGameLoaded = function () {

		if (!m_gameState.gameStarted)
			return;
		
		self._eworld.trigger(GameplayEvents.GameState.TURN_CHANGING, m_gameState, true);

		if (m_gameState.currentPlayer == null)
			m_gameState.currentPlayer = m_playersData.getFirstPlayingPlayer();
		
		if (m_gameState.currentPlayer != null) {

			populateGameStateUnits();

			
			var viewer = canView(m_gameState.currentPlayer) 
				? m_gameState.currentPlayer
				: m_playersData.players.find(function (player) {
					return player.isPlaying && canView(player);
				});


			if (viewer) {
				m_gameState.viewerPlayer = viewer;
				self._eworld.trigger(GameplayEvents.GameState.VIEWER_CHANGED, m_gameState, true);
			}
			
			self._eworld.triggerAsync(GameplayEvents.GameState.TURN_CHANGED, m_gameState, true);
		} else {
			m_gameState.viewerPlayer = null;
			self._eworld.trigger(GameplayEvents.GameState.VIEWER_CHANGED, m_gameState, true);

			self._eworld.triggerAsync(GameplayEvents.GameState.NO_PLAYING_PLAYERS);
		}
	}
	
	var onEndTurn = function () {

		self._eworld.trigger(GameplayEvents.GameState.TURN_CHANGING, m_gameState, false);

		var previousPlayer = m_gameState.currentPlayer;
		
		if (m_gameState.currentPlayer != null) {
			m_gameState.currentPlayer = m_playersData.getNextPlayingPlayer(m_gameState.currentPlayer);
		} else {
			m_gameState.currentPlayer = m_playersData.getFirstPlayingPlayer();
		}
		
		// If had no current player and still have none, do nothing.
		if (m_gameState.currentPlayer == null) {
			m_gameState.viewerPlayer = null;
			self._eworld.trigger(GameplayEvents.GameState.VIEWER_CHANGED, m_gameState, false);

			self._eworld.triggerAsync(GameplayEvents.GameState.NO_PLAYING_PLAYERS);
			return;
		}
		
		if (previousPlayer != null && previousPlayer.playerId > m_gameState.currentPlayer.playerId) {
			++m_gameState.turnsPassed;
		}
		
		if (canView(m_gameState.currentPlayer)) {
			m_gameState.viewerPlayer = m_gameState.currentPlayer;
			self._eworld.trigger(GameplayEvents.GameState.VIEWER_CHANGED, m_gameState, false);
		}
		
		populateGameStateUnits();
		
		self._eworld.triggerAsync(GameplayEvents.GameState.TURN_CHANGED, m_gameState, false);
	}

	var onPlayerDefeated = function (player) {
		m_playersData.setIsPlaying(player, false);
	}

	var onPlayersVictorious = function (winners) {
		m_gameState.winners = winners;

		for(var i = 0; i < winners.length; ++i) {
			m_playersData.setIsPlaying(winners[i], false);
		}
	}
	
	var onPlayerRemoved = function (player) {
		if (player == m_gameState.currentPlayer) {
			self._eworld.trigger(GameplayEvents.GameState.END_TURN);
		}
	}

	var onIsPlayingChanged = function (player) {
		if (!player.isPlaying) {
			onPlayerRemoved(player);
		}
	}
};

ECS.EntityManager.registerSystem('GameStateSystem', GameStateSystem);
SystemsUtils.supplyComponentFilter(GameStateSystem, [CTilePlaceable]);