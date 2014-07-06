"use strict";

var CUnit = function CUnit() {
	this.name = '';
	this.health = 0;

	this.turnPoints = 1;
	this.finishedTurn = false;



	// TODO: Maybe exclude these from serialization?

	// If currently previewing movement etc, this stores the original tile
	// so the line of sight doesn't actually change until preview is accepted.
	this.previewOriginalTile = null;

	this.hasAttacked = false;
};

ComponentsUtils.registerPersistent(CUnit);
