//===============================================
//This wormhole-Mockup.js MOCKUP is compatible with
// MoSync 3.1.1
//===============================================

// =============================================================
/*
This file is for INTERNAL use only!
 */


/*
 * @author Filip Slavov (NibbleByte)
 *
 * This file mocks up wormhole.js, in order to run properly in desktop browser.
 * Must be included right after wormhole.js!
 */

if (!mosync.isAndroid && !mosync.isIOS && !mosync.isWindowsPhone) {
	
	mosync.isMockUp = true;
	
	mosync.bridge.sendRaw = function(data)	{
		console.log('----- mosync.bridge.sendRaw -----');
		console.log(data);
		console.log('=================================');
	};
}