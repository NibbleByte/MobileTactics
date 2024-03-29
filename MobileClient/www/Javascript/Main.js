// Main entry point

"use strict";

/**
 * Handle the back button event.
 */
 var Application = {

	close: function () {
		// Close the application if the back key is pressed.
		if (navigator.app) {
			navigator.app.exitApp();
		} else if (navigator.device) {
			navigator.device.exitApp();
		} else {
			console.warn('Can\'t find the exit.');
		}
	},

	tryAcceptDialogs: function () {
		var count = 0;
		count += $('.btn_apply:visible').click().length;
		count += $('.btn_done:visible').click().length;

		return count != 0;
	},

	tryCancelDialogs: function () {
		var count = 0;
		count += $('.btn_cancel:visible').click().length;
		count += $('.btn_done:visible').click().length;

		return count != 0;
	},
}

$(function () {
	
	var onScreenResize = function (event) {
		var screenStats = '';
		//screenStats += 'Screen Width: ' + screen.width + '<br />';
		screenStats += 'Resution: ' +  window.innerWidth + 'x' + window.innerHeight + '<br />';
		screenStats += 'DPR: ' + DisplayManager.devicePixelRatio + ' (x' + DisplayManager.zoom.toPrecision(2) + ')' + '<br />';
		$('#ScreenStats').html(screenStats);
	}

	var onDeviceReady = function () {
		//
		// Init utils
		//
		var m_console = initConsole();

		window.frameStats = new FrameStats($('#FrameStats'), 1000);
		window.frameStats.pause();


		if (ClientUtils.urlParams['WorldEditor']) {
			ClientStateManager.changeState(ClientStateManager.types.WorldEditor);
		} else if (ClientUtils.urlParams['Test']) {
			ClientStateManager.changeState(ClientStateManager.types.TestGame);
		} else if (ClientUtils.urlParams['Save']) {
			MenuScreenState.selectedSaveName = ClientUtils.urlParams['Save'];
			var saveData = SavesStorage.loadGame(MenuScreenState.selectedSaveName);

			if (!saveData) {
				ClientStateManager.changeState(ClientStateManager.types.MenuScreen);
				console.warn('Save ' + MenuScreenState.selectedSaveName + ' not found.');

			} else {
				ClientStateManager.changeState(ClientStateManager.types.TestGame, saveData);
			}

		} else {
			ClientStateManager.changeState(ClientStateManager.types.MenuScreen);
		}




		$(document).keydown(function (e) {
			if (e.which == 13) {	// Enter
				e.preventDefault();
				Application.tryAcceptDialogs();
			}

			if (e.which == 27) {	// ESC
				e.preventDefault();
				$(document).trigger('backbutton');
			}

			if (e.which == 16) {	// Shift
				e.preventDefault();
				$(document).trigger('menubutton');
			}
		});

		
		$(window).on('resize', onScreenResize);
		$(window).on('orientationchange', onScreenResize);

		onScreenResize();
	}

	// Hook to deviceready event or start directly.
	if (window.cordova) {
		document.addEventListener("deviceready", onDeviceReady, false);
		console.log('Waiting for deviceready event.');

	} else {
		onDeviceReady();
	}
});
