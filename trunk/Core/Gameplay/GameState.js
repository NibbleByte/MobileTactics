//===============================================
// GameState
// Holds game state info (turns, statistics, parameters etc.)
//===============================================
"use strict";

// Read-only data.
var GameState = function () {
	this.currentPlayer = null;
	this.turnsPassed = 0;
}

Serialization.registerClass(GameState, 'GameState');

GameState.BLACKBOARD_NAME = 'GameState';