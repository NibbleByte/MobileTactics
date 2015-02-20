// Main entry point

"use strict";

// DEBUG: Global access
var currentState;

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
	var params = getUrlVars();

	if (params['WorldEditor']) {
		currentState = ClientStateManager.changeState(ClientStateManager.types.WorldEditor);
	} else {
		currentState = ClientStateManager.changeState(ClientStateManager.types.TestGame);
	}

	$(document).keydown(function (e) {
		if (e.which == 13) {	// Enter
			e.preventDefault();
			$('.btn_apply:visible').click();
		}

		if (e.which == 27) {	// ESC
			e.preventDefault();
			$('.btn_cancel:visible').click();
		}
	});
	
	// MoSync bindings
	document.addEventListener("backbutton", close, true);
});

