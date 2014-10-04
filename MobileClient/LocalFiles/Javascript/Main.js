// Main entry point

"use strict";

// DEBUG: Global access
var clientState;

/**
 * Handle the backbutton event.
 */
function close() {
	// Close the application if the back key is pressed.
	mosync.bridge.send(["close"]);
}

$(function () {
	
	//
	// Init utils
	//
	var m_console = initConsole();
	var m_loadingScreen = $('#LoadingScreen');

	clientState = ClientStates.setupTestGame(m_loadingScreen);

	
	// MoSync bindings
	document.addEventListener("backbutton", close, true);
});

