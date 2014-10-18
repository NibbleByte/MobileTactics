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
	isAndroid: mosync.isAndroid,
	isIOS: mosync.isIOS,
	isWindowsPhone: mosync.isWindowsPhone,
};
