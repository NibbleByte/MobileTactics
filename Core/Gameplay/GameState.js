//===============================================
// GameState
// Holds game state info (turns, statistics, parameters etc.)
//===============================================
"use strict";

// Read-only data.
var GameState = function () {
	this.init();
}

GameState.prototype.init = function () {
	this.currentPlayer = null;
	this.viewerPlayer = null;	// Viewer might be different than current player. For example: player vs AI. Player shouldn't see AI moves.
	this.turnsPassed = 0;
	this.isCustomMap = true;
	this.fogOfWar = true;
	this.gameStarted = false;
	this.winners = [];
	
	this.currentPlaceables = [];
	this.relationPlaceables = [];
	this.relationPlaceables[PlayersData.Relation.Enemy] = [];
	this.relationPlaceables[PlayersData.Relation.Neutral] = [];
	this.relationPlaceables[PlayersData.Relation.Ally] = [];

	this.visiblePlaceables = [];
	this.visiblePlaceables[PlayersData.Relation.Enemy] = [];
	this.visiblePlaceables[PlayersData.Relation.Neutral] = [];
	this.visiblePlaceables[PlayersData.Relation.Ally] = [];

	this.ownerableStructures = [];

	this.currentStructures = [];
	this.currentStructuresTypes = {};	// Holds current structures by tile type.
	this.relationStructures = [];
	this.relationStructures[PlayersData.Relation.Enemy] = [];
	this.relationStructures[PlayersData.Relation.Neutral] = [];
	this.relationStructures[PlayersData.Relation.Ally] = [];

	this.knownStructures = [];
	this.knownStructures[PlayersData.Relation.Enemy] = [];
	this.knownStructures[PlayersData.Relation.Neutral] = [];
	this.knownStructures[PlayersData.Relation.Ally] = [];

	this.currentIncome = 0;
}

Serialization.registerClass(GameState, 'GameState');

GameState.prototype.clearPlaceables = function () {
	this.currentPlaceables.clear();
	
	for(var i = 0; i < this.relationPlaceables.length; ++i) {
		this.relationPlaceables[i].clear();
	}

	for(var i = 0; i < this.visiblePlaceables.length; ++i) {
		this.visiblePlaceables[i].clear();
	}
}

GameState.prototype.clearStructures = function () {
	this.currentStructures.clear();
	
	for(var type in this.currentStructuresTypes) {
		this.currentStructuresTypes[type].clear();
	}
	
	for(var i = 0; i < this.relationStructures.length; ++i) {
		this.relationStructures[i].clear();
	}

	for(var i = 0; i < this.knownStructures.length; ++i) {
		this.knownStructures[i].clear();
	}
}

GameState.prototype.hasGameFinished = function () {
	return this.winners.length > 0;
}

GameState.serialize = function (input, output, instanceRegister) {

	output.currentPlayer = Serialization.serializeCustom(input.currentPlayer, instanceRegister);
	output.turnsPassed = Serialization.serializeCustom(input.turnsPassed, instanceRegister);
	output.isCustomMap = Serialization.serializeCustom(input.isCustomMap, instanceRegister);
	output.gameStarted = Serialization.serializeCustom(input.gameStarted, instanceRegister);
	output.winners = Serialization.serializeCustom(input.winners, instanceRegister);
	output.fogOfWar = Serialization.serializeCustom(input.fogOfWar, instanceRegister);
};

GameState.deserialize = function (input, output, instanceRegister, outAllObjects) {

	output.init();

	output.currentPlayer = Serialization.deserializeCustom(input.currentPlayer, instanceRegister, outAllObjects);
	output.turnsPassed = Serialization.deserializeCustom(input.turnsPassed, instanceRegister, outAllObjects);
	output.isCustomMap = Serialization.deserializeCustom(input.isCustomMap, instanceRegister, outAllObjects);
	output.gameStarted = Serialization.deserializeCustom(input.gameStarted, instanceRegister, outAllObjects);
	output.winners = Serialization.deserializeCustom(input.winners, instanceRegister, outAllObjects) || [];
	output.fogOfWar = Serialization.deserializeCustom(input.fogOfWar, instanceRegister, outAllObjects);
};
