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
};

if (ClientUtils.isAndroid) {
	ClientUtils.androidVersion = parseFloat(ClientUtils.androidVersionFull);
}
