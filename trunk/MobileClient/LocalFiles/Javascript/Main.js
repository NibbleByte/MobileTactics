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

function getUrlVars(asArray) {
	var vars = (asArray) ? [] : {}, hash;

	if (!window.location.search)
		return vars;

	var q = window.location.search.slice(1);
	q = q.split('&');
	for (var i = 0; i < q.length; i++) {
		hash = q[i].split('=');

		if (asArray) vars.push(decodeURI(hash[1]));
		vars[hash[0]] = decodeURI(hash[1]);
	}

	return vars;
}

$(function () {
	
	//
	// Init utils
	//
	var m_console = initConsole();
	var m_loadingScreen = $('#LoadingScreen');
	var params = getUrlVars();

	if (params['WorldEditor']) {
		//clientState = ClientStates.factories[ClientStates.types.WorldEditor].setup(m_loadingScreen);
	} else {
		clientState = ClientStates.factories[ClientStates.types.TestGame].setup(m_loadingScreen);
	}

	
	// MoSync bindings
	document.addEventListener("backbutton", close, true);
});

