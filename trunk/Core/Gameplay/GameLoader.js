//===============================================
// GameLoader
// Loads or creates a game.
//===============================================
"use strict";

var GameLoader = function (m_targetState, m_eworld) {
	
	this.create = function (preloadHandler, createHandler) {

		m_targetState.world.clearTiles();

		if (m_targetState.playersData) Utils.invalidate(m_targetState.playersData);
		if (m_targetState.gameState) Utils.invalidate(m_targetState.gameState);
		if (m_targetState.gameMetaData) Utils.invalidate(m_targetState.gameMetaData);


		// Initialize new data
		m_targetState.playersData = new PlayersData(m_eworld);
		m_targetState.gameState = new GameState();
		m_targetState.gameMetaData = new GameMetaData();
		m_eworld.store(PlayersData, m_targetState.playersData);
		m_eworld.store(GameState, m_targetState.gameState);
		m_eworld.store(GameMetaData, m_targetState.gameMetaData);

		if (preloadHandler) preloadHandler(m_eworld, m_targetState);

		m_eworld.blackboard[EngineBlackBoard.Serialization.IS_LOADING] = true;

		m_eworld.trigger(EngineEvents.General.GAME_LOADING);

		createHandler(m_eworld, m_targetState);

		var failReasons = [];
		m_eworld.trigger(EngineEvents.General.GAME_VALIDATE, failReasons);
		if (failReasons.length > 0) {
			m_eworld.trigger(EngineEvents.General.GAME_VALIDATION_FAILED, failReasons);
		}

		m_eworld.triggerAsync(EngineEvents.General.GAME_LOADED);

		m_eworld.blackboard[EngineBlackBoard.Serialization.IS_LOADING] = false;
	}

	this.load = function (data, preloadHandler) {

		m_targetState.world.clearTiles();

		if (m_targetState.playersData) Utils.invalidate(m_targetState.playersData);
		if (m_targetState.gameState) Utils.invalidate(m_targetState.gameState);
		if (m_targetState.gameMetaData) Utils.invalidate(m_targetState.gameMetaData);

		var allObjects = [];

		var fullGameState = Serialization.deserialize(data, allObjects);

		m_targetState.gameState = fullGameState.gameState;
		m_targetState.gameMetaData = fullGameState.gameMetaData || new GameMetaData();
		m_targetState.playersData = fullGameState.playersData;
		m_eworld.store(PlayersData, m_targetState.playersData);
		m_eworld.store(GameState, m_targetState.gameState);
		m_eworld.store(GameMetaData, m_targetState.gameMetaData);


		if (preloadHandler) preloadHandler(fullGameState, m_eworld, m_targetState);

		m_eworld.blackboard[EngineBlackBoard.Serialization.IS_LOADING] = true;

		m_eworld.trigger(EngineEvents.General.GAME_LOADING);

		for (var i = 0; i < allObjects.length; ++i) {
			if (allObjects[i].onDeserialize)
				allObjects[i].onDeserialize(m_eworld);
		}

		var entities = fullGameState.world;
		for (var i = 0; i < entities.length; ++i) {

			UnitsFactory.postDeserialize(entities[i]);
			m_eworld.addUnmanagedEntity(entities[i]);
		}

		for (var i = 0; i < entities.length; ++i) {
			m_eworld.trigger(EngineEvents.Serialization.ENTITY_DESERIALIZED, entities[i]);
		}

		var failReasons = [];
		m_eworld.trigger(EngineEvents.General.GAME_VALIDATE, failReasons);
		if (failReasons.length > 0) {
			m_eworld.trigger(EngineEvents.General.GAME_VALIDATION_FAILED, failReasons);
		}

		m_eworld.triggerAsync(EngineEvents.General.GAME_LOADED);

		m_eworld.blackboard[EngineBlackBoard.Serialization.IS_LOADING] = false;
	}
}
