//////////////////////////////////////////////////////////////
// Display manager detects device resolution, scale, etc.
// Scales down viewport so images are original size (based on devicePixelRatio)
//
// Place this script before everything else loads up. Generates appropriate meta tag.
//////////////////////////////////////////////////////////////
"use strict";

var DisplayManager = new function () {

	var params = getUrlVars();

	this.devicePixelRatio = window.devicePixelRatio || 1;

	// Web-view is zoomed-in by default depending on the device PPI (represented by the devicePixelRatio)
	// in order to compensate large resolutions with small physical dimensions. Makes sites to look "normal" physical size.
	// This means all images will be stretched for higher PPI, which is ugly for a game.
	// Good explanation: http://www.paintcodeapp.com/news/ultimate-guide-to-iphone-resolutions
	//this.zoom =  1 / this.devicePixelRatio;
	this.zoom = (1 / Assets.scale) / this.devicePixelRatio;


	if (params['Zoom'] || params['zoom']) {
		this.zoom = params['Zoom'] || params['zoom'] || this.zoom;
		this.zoom = parseFloat(this.zoom);
		this.devicePixelRatio = 1 / this.zoom;
	}

	var template = '<meta name="viewport" content="width=device-width, height=device-height, user-scalable=no, initial-scale=$scale, maximum-scale=$scale, minimum-scale=$scale, target-densitydpi=device-dpi">';

	document.write(template.replace(new RegExp('\\$scale', 'g'), this.zoom.toPrecision(2)));

	document.addEventListener("DOMContentLoaded", function(event) {
		$(document.body).addClass(' asset-scale-' + Assets.scale);
	});
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