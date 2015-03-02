//===============================================
// Colors
// Provides utilities for dealing with colors.
//===============================================
"use strict";

var Colors = {

	// RGB to HSV conversion: http://www.cs.rit.edu/~ncs/color/t_convert.html

	// r,g,b values [0, 255]
	// h = [0,360], s = [0,1], v = [0,1]
	//		if s == 0, then h = -1 (undefined)
	rgb2hsvFast: function (r, g, b, outHSV) {
		
		// Map to [0, 1];
		r /= 255;
		g /= 255;
		b /= 255;
		
		var min = Math.min( r, g, b );
		var max = Math.max( r, g, b );
		outHSV.v = max;				// v

		var delta = max - min;

		if( max != 0 )
			outHSV.s = delta / max;		// s
		else {
			// r = g = b = 0			// s = 0, v is undefined
			outHSV.s = 0;
			outHSV.h = -1;
			return;
		}

		if( r == max )
			outHSV.h = ( g - b ) / delta;		// between yellow & magenta
		else if( g == max )
			outHSV.h = 2 + ( b - r ) / delta;	// between cyan & yellow
		else
			outHSV.h = 4 + ( r - g ) / delta;	// between magenta & cyan

		outHSV.h *= 60;				// degrees
		if( outHSV.h < 0 )
			outHSV.h += 360;
	},

	hsv2rgbFast: function (h, s, v, outRGB) {

		if( s == 0 ) {
			// achromatic (grey); Map to [0, 255]
			outRGB.r = outRGB.g = outRGB.b = v * 255;
			return;
		}

		h /= 60;			// sector 0 to 5
		var i = Math.floor( h );
		var f = h - i;			// factorial part of h
		var p = v * ( 1 - s );
		var q = v * ( 1 - s * f );
		var t = v * ( 1 - s * ( 1 - f ) );

		switch( i ) {
			case 0:
				outRGB.r = v;
				outRGB.g = t;
				outRGB.b = p;
				break;
			case 1:
				outRGB.r = q;
				outRGB.g = v;
				outRGB.b = p;
				break;
			case 2:
				outRGB.r = p;
				outRGB.g = v;
				outRGB.b = t;
				break;
			case 3:
				outRGB.r = p;
				outRGB.g = q;
				outRGB.b = v;
				break;
			case 4:
				outRGB.r = t;
				outRGB.g = p;
				outRGB.b = v;
				break;
			default:		// case 5:
				outRGB.r = v;
				outRGB.g = p;
				outRGB.b = q;
				break;
		}

		// Map to [0, 255];
		outRGB.r *= 255;
		outRGB.g *= 255;
		outRGB.b *= 255;
	},


	rgb2hex: function (rgb) {
		var rHex = parseInt(rgb.r).toString(16);
		var gHex = parseInt(rgb.g).toString(16);
		var bHex = parseInt(rgb.b).toString(16);

		if (rHex.length == 1) rHex = '0' + rHex;
		if (gHex.length == 1) gHex = '0' + gHex;
		if (bHex.length == 1) bHex = '0' + bHex;

		return '#' + rHex + gHex + bHex;
	}
};