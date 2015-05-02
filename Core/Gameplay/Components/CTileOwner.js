"use strict";

var CTileOwner = function CTileOwner() {
	this.owner = null;				// Player

	this.knowledge = {};			// <playerId, owner> - who does given player think the owner is.

	this.beingCapturedBy = null;	// Unit
	this.captureTurns = 0;			// Remaining capture turns.
};


CTileOwner.isCapturing = function (unit) {
	var tile = unit.CTilePlaceable.tile;

	return tile.CTileOwner && tile.CTileOwner.beingCapturedBy == unit;
}

ComponentsUtils.registerPersistent(CTileOwner);
