"use strict";

var CTileTerrain = function CTileTerrain() {
	
	this.type = GameWorldTerrainType.None;
	this.skin = 0;		// 0 means default.
};

ComponentsUtils.registerPersistent(CTileTerrain);

