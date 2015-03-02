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

	isIOS: 
		(navigator.userAgent.indexOf("iPod") != -1) ||
		(navigator.userAgent.indexOf("iPhone") != -1) ||
		(navigator.userAgent.indexOf("iPad") != -1),

	isWindowsPhone:
		navigator.userAgent.indexOf("Windows Phone OS") != -1,
};

