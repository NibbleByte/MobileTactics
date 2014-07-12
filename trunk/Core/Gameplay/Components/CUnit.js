"use strict";

var CUnit = function CUnit() {
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

	this.executedActions = [];

	// If currently previewing movement etc, this stores the original tile
	// so the line of sight doesn't actually change until preview is accepted.
	this.previewOriginalTile = null;
}
Serialization.excludeClass(ActionsData);

ActionsData.prototype.hasExecutedAction = function (actionType) {
	return this.executedActions.indexOf(actionType) != -1;
};

ComponentsUtils.registerPersistent(CUnit);
