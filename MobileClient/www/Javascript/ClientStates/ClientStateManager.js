//===============================================
// ClientStateManager
// Defines the client types of states
//===============================================
"use strict";

var ClientStateManager = new function () {

	var m_factories = [];
	var m_currentState = null;

	var m_loadingScreen = $('#LoadingScreen');
	
	this.types = {
		TestGame: 0,
		MenuScreen: 0,
		LocalGame: 0,
		NetworkGame: 0,
		WorldEditor: 0,
	};

	this.registerState = function (type, stateFactory) {

		if (Utils.assert(!m_factories[type]))
			return;

		m_factories[type] = stateFactory;
	};

	this.changeState = function (type) {

		if (m_currentState) {
			m_factories[m_currentState.type].cleanUp();
		}
			
		m_currentState = m_factories[type].setup(m_loadingScreen);
		m_currentState.type = type;

		return m_currentState;
	};
};

Enums.enumerate(ClientStateManager.types);