// Main entry point

"use strict";

// DEBUG: Global access
var currentState;

/**
 * Handle the back button event.
 */
function close() {
	// Close the application if the back key is pressed.
	if (navigator.app) {
		navigator.app.exitApp();
	} else if (navigator.device) {
		navigator.device.exitApp();
	} else {
		console.warn('Can\'t find the exit.');
	}
}

$(function () {
	
	var onDeviceReady = function () {
		//
		// Init utils
		//
		var m_console = initConsole();

		if (ClientUtils.urlParams['WorldEditor']) {
			currentState = ClientStateManager.changeState(ClientStateManager.types.WorldEditor);
		} else {
			currentState = ClientStateManager.changeState(ClientStateManager.types.TestGame);
		}

		$(document).keydown(function (e) {
			if (e.which == 13) {	// Enter
				e.preventDefault();
				$('.btn_apply:visible').click();
				$('.btn_done:visible').click();
			}

			if (e.which == 27) {	// ESC
				e.preventDefault();
				$('.btn_cancel:visible').click();
				$('.btn_done:visible').click();
			}
		});
	
		// Phonegap bindings
		document.addEventListener("backbutton", close, true);
	}

	// Hook to deviceready event or start directly.
	if (window.cordova) {
		document.addEventListener("deviceready", onDeviceReady, false);
		console.log('Waiting for deviceready event.');

	} else {
		onDeviceReady();
	}
});
