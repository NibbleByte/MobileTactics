"use strict";

var CTileTerrain = function () {
	
	this.type = GameWorldTerrainType.None;
	
	this.movementCostLeft = 0;	// Used by search algorithms.
	
};

ComponentsUtils.registerPersistent('CTileTerrain', CTileTerrain);