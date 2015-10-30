//////////////////////////////////////////////////////////////
// Display manager detects device resolution, scale, etc.
// Scales down viewport so images are original size (based on devicePixelRatio)
//
// Place this script before everything else loads up. Generates appropriate meta tag.
//////////////////////////////////////////////////////////////
"use strict";

var DisplayManager = new function () {

	var self = this;

	this.devicePixelRatio = window.devicePixelRatio || 1;

	// Web-view is zoomed-in by default depending on the device PPI (represented by the devicePixelRatio)
	// in order to compensate large resolutions with small physical dimensions. Makes sites to look "normal" physical size.
	// This means all images will be stretched for higher PPI, which is ugly for a game.
	// Good explanation: http://www.paintcodeapp.com/news/ultimate-guide-to-iphone-resolutions
	//this.zoom = (1 / Assets.scale) / this.devicePixelRatio;

	// NOTE: Using customized per-dpr based hard-coded numbers,
	//		 as it seems easier than having a single do-it-all formula as the dpr itself is pretty untrustworthy.
	//		 In other words: calculating is one thing, making it look good in different combinations is completely different story.
	// Example:  dpr  |  as  |  zoom
	//			 1.0	1.0		1.0
	//			 1.5	1.0		0.8  // Try to keep original size and reduce stretching.
	//			 2.0	1.0		1.0	 // Image is too small by now, stretching is needed.
	var calculateZoom = function (dpr, as) {

		if (as == 1) {
		
			if (dpr <= 1.4)	return (1 / dpr);
			if (dpr <= 1.9)	return (0.8);	// 0.75 is more sharp but too small.
			
			// Anything bigger... just scale it :(
			return 1.0;
		}
		
		if (as == 2) {
			if (dpr <= 1.4)	return ((1 / as) / dpr);
			if (dpr <= 1.9)	return ((1 / as) * 0.9);
			if (dpr <= 2.5) return (1 / dpr);

			// TODO: Test on device with dpr 3 or higher.
			return 0.25 * dpr;
		}

		// TODO: Test these as well.
		if (as == 3) {
			if (dpr <= 1.4)	return ((1 / as) / dpr);
			if (dpr <= 1.9)	return ((1 / as) * 0.9);
			if (dpr <= 2.5) return ((1 / as) * 0.75);
			if (dpr <= 3.5) return (1 / dpr);

			return 0.25 * dpr;
		}
		

		return 1 / dpr;
	};
	
	this.zoom = calculateZoom(this.devicePixelRatio, Assets.scale);


	if (ClientUtils.urlParams['Zoom'] || ClientUtils.urlParams['zoom']) {
		this.zoom = ClientUtils.urlParams['Zoom'] || ClientUtils.urlParams['zoom'] || this.zoom;
		this.zoom = parseFloat(this.zoom);
		this.devicePixelRatio = 1 / this.zoom;
	}

	// Using different approach
	//var template = '<meta name="viewport" content="width=device-width, height=device-height, user-scalable=no, initial-scale=$scale, maximum-scale=$scale, minimum-scale=$scale, target-densitydpi=device-dpi">';

	//document.write(template.replace(new RegExp('\\$scale', 'g'), this.zoom.toPrecision(2)));

	document.addEventListener("DOMContentLoaded", function(event) {
		$(document.body).addClass('asset-scale-' + Assets.scale);
	});


	this.zoomInElement = function (element) {
		RenderUtils.transformSet(element, 'scale(' + self.zoom + ')');
	}
}

DisplayManager.ScreenDensityType = {
	Low: 0,
	Medium: 1,
	High: 2,
	XHigh: 3,
	XXHigh: 4,
	XXXHigh: 5,
};

// Decide PPI category based on the devicePixelRatio.
// Using Android conventions.
// URL: http://tekeye.biz/2013/android-dpi-dip-dp-ppi-sp-and-screens
// URL: http://developer.android.com/guide/practices/screens_support.html
if (DisplayManager.devicePixelRatio <  1.0) DisplayManager.densityType = DisplayManager.ScreenDensityType.Low;
if (DisplayManager.devicePixelRatio >= 1.0) DisplayManager.densityType = DisplayManager.ScreenDensityType.Medium;
if (DisplayManager.devicePixelRatio >= 1.5) DisplayManager.densityType = DisplayManager.ScreenDensityType.High;
if (DisplayManager.devicePixelRatio >= 2.0) DisplayManager.densityType = DisplayManager.ScreenDensityType.XHigh;
if (DisplayManager.devicePixelRatio >= 3.0) DisplayManager.densityType = DisplayManager.ScreenDensityType.XXHigh;
if (DisplayManager.devicePixelRatio >= 4.0) DisplayManager.densityType = DisplayManager.ScreenDensityType.XXXHigh;