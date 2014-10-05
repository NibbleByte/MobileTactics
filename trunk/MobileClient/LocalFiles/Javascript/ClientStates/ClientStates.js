//===============================================
// ClientStates
// Defines the client types of states
//===============================================
"use strict";

var ClientStates = {
	
	types: {
		TestGame: 0,
		MainMenu: 0,
		LocalGame: 0,
		NetworkGame: 0,
		WorldEditor: 0,
	},
	
	factories: [],
};

Enums.enumerate(ClientStates.types);