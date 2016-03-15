//===============================================
// ClientStateManager
// Defines the client types of states
//===============================================
"use strict";

// DEBUG: Global access
var currentState;

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
	Enums.enumerate(this.types);

	this.registerState = function (type, stateFactory) {

		if (Utils.assert(!m_factories[type]))
			return;

		m_factories[type] = stateFactory;
	};

	this.changeState = function (type, param1, param2, param3, param4) {

		if (m_currentState) {
			m_factories[m_currentState.type].cleanUp();
		}
			
		m_currentState = m_factories[type].setup(m_loadingScreen, param1, param2, param3, param4);
		m_currentState.type = type;

		currentState = m_currentState;

		return m_currentState;
	};
};