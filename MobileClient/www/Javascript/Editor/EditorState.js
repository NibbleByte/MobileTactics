//===============================================
// EditorState
// Holds game state info (turns, statistics, parameters etc.)
//===============================================
"use strict";

// Read-only data.
var EditorState = function () {
	this.init();
}

EditorState.prototype.init = function () {
	this.mapLockedSizes = false;
	this.playersCount = 2;
}

Serialization.registerClass(EditorState, 'EditorState');
