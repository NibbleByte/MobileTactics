//////////////////////////////////////////////////////////////
// Global tile constants shared among the rendering classes.  
//////////////////////////////////////////////////////////////
"use strict";

var GTile = {};

GTile.TILE_WIDTH = 64;
GTile.TILE_HEIGHT = GTile.TILE_WIDTH;

// Source: http://www.mattpalmerlee.com/2012/04/05/fun-with-hexagon-math-for-games/
GTile.TILE_SIDE = ( 2 * GTile.TILE_WIDTH - Math.sqrt(4 * GTile.TILE_WIDTH * GTile.TILE_WIDTH + 
		12 * (GTile.TILE_HEIGHT * GTile.TILE_HEIGHT + GTile.TILE_WIDTH * GTile.TILE_WIDTH)) ) / (-6);

GTile.TILE_HOFFSET = (GTile.TILE_WIDTH - GTile.TILE_SIDE) / 2 + GTile.TILE_SIDE;
GTile.TILE_VOFFSET = GTile.TILE_HEIGHT / 2;

// TODO: Remove this useless padding from the code! Use HTML + CSS (check with on-click event).
GTile.LAYERS_PADDING = 32;
