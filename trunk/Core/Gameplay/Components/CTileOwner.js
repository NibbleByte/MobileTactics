"use strict";

var CTileOwner = function CTileOwner() {
	this.owner = null;				// Player

	this.beingCapturedBy = null;	// Unit
	this.captureTurns = 0;			// Remaining capture turns.
};


CTileOwner.isCapturing = function (unit) {
	var tile = unit.CTilePlaceable.tile;

	return tile.CTileOwner && tile.CTileOwner.beingCapturedBy == unit;
}

ComponentsUtils.registerPersistent(CTileOwner);
