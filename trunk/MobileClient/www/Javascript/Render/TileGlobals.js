//////////////////////////////////////////////////////////////
// Global tile constants shared among the rendering classes.  
//////////////////////////////////////////////////////////////
"use strict";

var GTile = {};

GTile.TILE_WIDTH = 64 * Assets.scale;
GTile.TILE_HEIGHT = 64 * Assets.scale;

GTile._SCALED_VSIDES = {
	1: 34,
	2: 68,
	3: 102,
}

GTile.TILE_VSIDE = GTile._SCALED_VSIDES[Assets.scale];	// Length of the vertical left/right side from the image



GTile.TILE_SIDE = 0;	// Will be set a bit later, below.

// Calculating the basis vectors. Used to make new coordinate system.
// http://www.redblobgames.com/grids/hexagons/#hex-to-pixel
GTile.TILE_BASIS_X = $V([1, 0]).multiply(GTile.TILE_WIDTH);
GTile.TILE_BASIS_Y = (function () {
	
	/*	This would be a crude drawing of a hexagon with pointy top.
	 *  Since it is symmetrical, we deal only the left part. 
	 * 
	 * 	          B
	 * 	         /|\
	 *       C  / | \
	 *         |  |	 |
	 *         |  |  |
	 *       D  \ |	/
	 *         	 \|/
	 *         	  A
	 * 
	 */
	
	// These are calculated with center of the hex at (0, 0).
	// Note that positive Y axis is down.
	
	var bottomCenter = $V([0, GTile.TILE_HEIGHT / 2]);  // That would be point A.
	var leftLower = $V([-GTile.TILE_WIDTH / 2, GTile.TILE_VSIDE / 2]);  // That would be point D.
	
	var side = bottomCenter.subtract(leftLower);
	var sideMiddle = leftLower.add(side.multiply(0.5));
	
	var basisY = sideMiddle.multiply(2);
	
	GTile.TILE_SIDE = side.modulus();
	return basisY;
}) ();

GTile.TILE_HOFFSET = GTile.TILE_WIDTH/ 2;
GTile.TILE_VOFFSET = (GTile.TILE_HEIGHT - GTile.TILE_VSIDE) / 2 + GTile.TILE_VSIDE;

// Get the slope of the top-left side (line) of the hex using the 2 available points.
GTile.TILE_SIDE_SLOPE = (0 - (GTile.TILE_HEIGHT - GTile.TILE_VOFFSET)) / (GTile.TILE_WIDTH / 2 - 0);

GTile.LAYERS_PADDING = 32 * Assets.scale;
