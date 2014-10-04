//===============================================
// WorldEditor
// Create a world editor client state.
//===============================================
"use strict";

ClientStates.setupWorldEditor = function (renderingElement) {

	var clientState = {
		type: ClientStates.types.WorldEditor,
		playersData: null,
		gameState: null,
	};

	return clientState;
};