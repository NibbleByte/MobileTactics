//===============================================
// GameMetaData
// Holds game name, description etc...
//===============================================
"use strict";

// Read-only data.
var GameMetaData = function () {
	this.init();
}

GameMetaData.prototype.init = function () {
	this.name = 'Unknown';
	this.description = '';
}

Serialization.registerClass(GameMetaData, 'GameMetaData');