//===============================================
// GameState
// Holds game state info (turns, statistics, parameters etc.)
//===============================================
"use strict";

// Read-only data.
var GameState = function () {
	this.currentPlayer = null;
	this.turnsPassed = 0;
	
	this.currentPlaceables = [];
	this.relationPlaceables = [];
	this.relationPlaceables[PlayersData.Relation.Enemy] = [];
	this.relationPlaceables[PlayersData.Relation.Neutral] = [];
	this.relationPlaceables[PlayersData.Relation.Ally] = [];
}

Serialization.registerClass(GameState, 'GameState');

GameState.BLACKBOARD_NAME = 'GameState';

GameState.prototype.clearPlaceables = function () {
	this.currentPlaceables.clear();
	
	for(var i = 0; i < this.relationPlaceables.length; ++i) {
		this.relationPlaceables[i].clear();
	}
}