//===============================================
// ClientUtils
// Figure it out.
//===============================================
"use strict";

var ClientUtils = {
		
	//
	// Device support
	//
	isTouchDevice: 'ontouchstart' in document.documentElement,

	isAndroid:
		navigator.userAgent.indexOf("Android") != -1,


	// AndroidVersion //"4.2.1"
	// parseInt(AndroidVersion, 10); //4
	// parseFloat(AndroidVersion); //4.2
	androidVersionFull: (function () {
			var ua = navigator.userAgent.toLowerCase(); 
			var match = ua.match(/android\s([0-9\.]*)/);
			return match ? match[1] : false;
		}) (),

	isIOS: 
		(navigator.userAgent.indexOf("iPod") != -1) ||
		(navigator.userAgent.indexOf("iPhone") != -1) ||
		(navigator.userAgent.indexOf("iPad") != -1),

	isWindowsPhone:
		navigator.userAgent.indexOf("Windows Phone OS") != -1,


	getUrlVars: function (asArray) {
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
	},
};

if (ClientUtils.isAndroid) {
	ClientUtils.androidVersion = parseFloat(ClientUtils.androidVersionFull);
}

ClientUtils.urlParams = ClientUtils.getUrlVars();
