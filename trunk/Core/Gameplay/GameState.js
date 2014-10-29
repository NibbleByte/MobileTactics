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

	this.bases = [];

	this.currentStructures = [];
	this.relationStructures = [];
	this.relationStructures[PlayersData.Relation.Enemy] = [];
	this.relationStructures[PlayersData.Relation.Neutral] = [];
	this.relationStructures[PlayersData.Relation.Ally] = [];
}

Serialization.registerClass(GameState, 'GameState');

GameState.prototype.clearPlaceables = function () {
	this.currentPlaceables.clear();
	
	for(var i = 0; i < this.relationPlaceables.length; ++i) {
		this.relationPlaceables[i].clear();
	}
}

GameState.prototype.clearStructures = function () {
	this.currentStructures.clear();
	
	for(var i = 0; i < this.relationStructures.length; ++i) {
		this.relationStructures[i].clear();
	}
}

GameState.serialize = function (input, output, instanceRegister) {

	output.currentPlayer = Serialization.serializeCustom(input.currentPlayer, instanceRegister);
	output.turnsPassed = Serialization.serializeCustom(input.turnsPassed, instanceRegister);
};

GameState.deserialize = function (input, output, instanceRegister) {

	output.currentPlayer = Serialization.deserializeCustom(input.currentPlayer, instanceRegister);
	output.turnsPassed = Serialization.deserializeCustom(input.turnsPassed, instanceRegister);
};
