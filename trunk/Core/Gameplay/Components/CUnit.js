"use strict";

var CUnit = function CUnit() {
	this.race = -1;
	this.name = '';
	this.health = 0;

	this.turnPoints = 1;
	this.finishedTurn = false;

	this.postDeserialize();
};

CUnit.prototype.postDeserialize = function () {
	this.actionsData = new ActionsData();
}

// Actions can add additional custom data to this instance, to help them execute correctly.
var ActionsData = function () {

	// Action that is being currently executed (because at that moment, it is not yet added to previously "executed" actions).
	this.currentActionType = null;

	// Holds data per turnPoint
	this.turnsData = [];
}
Serialization.excludeClass(ActionsData);


ActionsData.TurnData = function () {

	this.executedActions = [];

	// If currently previewing movement etc, this stores the original tile
	// so the line of sight doesn't actually change until preview is accepted.
	this.previewOriginalTile = [];
}



ActionsData.prototype.addExecutedAction = function (turnPointsIndex, actionType) {
	this.getTurnData(turnPointsIndex).executedActions.push(actionType);
};

ActionsData.prototype.hasExecutedAction = function (turnPointsIndex, actionType) {
	return this.getTurnData(turnPointsIndex).executedActions.indexOf(actionType) != -1;
};

ActionsData.prototype.removeLastExecutedAction = function (turnPointsIndex, actionType) {
	this.getTurnData(turnPointsIndex).executedActions.removeLast(actionType);
};

ActionsData.prototype.getTurnData = function (turnPointsIndex) {
	
	// Ensure that collection exist
	// NOTE: Since turnPoints are 3,2,1... the 0th element might never be used.
	//		 But object still can be querried when 0th turn point.
	while (this.turnsData.length <= turnPointsIndex) {
		this.turnsData.push(new ActionsData.TurnData());
	}

	return this.turnsData[turnPointsIndex];
};

ActionsData.prototype.clearExecutedActions = function () {
	this.turnsData = [];
};

ComponentsUtils.registerPersistent(CUnit);
