//===============================================
// This cordova-Mockup.js MOCKUP is compatible with
// Cordova 4.2.0
//===============================================

// =============================================================
/*
This file is for INTERNAL use only!
 */


/*
 * @author Filip Slavov (NibbleByte)
 *
 * This file mocks up cordova.js, in order to run properly in desktop browser.
 * Must be included right after cordova.js!
 */

 
if (!ClientUtils.isAndroid && !ClientUtils.isIOS && !ClientUtils.isWindowsPhone) {
	
	ClientUtils.isMockUp = true;
}
