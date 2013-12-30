//===============================================
// GameWorldRenderer
// Holds the main elements needed for rendering anyhing.
//===============================================
"use strict";

var GameWorldRenderer = function (holderElement) {
	var self = this;
	
	console.assert(holderElement instanceof HTMLElement, "HTMLElement is required.");
		
	this.pnHolder = holderElement;
	this.extentWidth = 0;
	this.extentHeight = 0;
	
	this.$pnWorldPlot = $('<div id="WorldPlot"></div>').appendTo(this.pnHolder);
	
	this.scene = sjs.Scene({
		parent: this.$pnWorldPlot[0],
		autoPause: false,
	});
	
	this.layers = [];
	
	for(var layerIndex in WorldLayers.LayerTypes) {
		this.layers[WorldLayers.LayerTypes[layerIndex]] = this.scene.Layer(layerIndex);
	}
	
	
	var plotContainerScroller = null;	
	
	this.refresh = function () {
		
		$(self.scene.dom).width(self.extentWidth);
		$(self.scene.dom).height(self.extentHeight);
		
		// TODO: Unneeded check, due to timeouts on initialize
		if (plotContainerScroller)
			plotContainerScroller.refresh();		
		
	}
	
	this.getRenderedTilePosition = function (row, column) {
		
		// http://www.redblobgames.com/grids/hexagons/#hex-to-pixel
		// basisX * column + basisY * row 
		var pos = GTile.TILE_BASIS_X.x(column).add( GTile.TILE_BASIS_Y.x(row) );
		
		return {
			x: pos.e(1) + GTile.LAYERS_PADDING,
			y: pos.e(2) + GTile.LAYERS_PADDING,
		};
	}
	
	this.getRenderedTileCenter = function (row, column) {
		var coords = self.getRenderedTilePosition(row, column);
		
		coords.x += GTile.TILE_WIDTH / 2;
		coords.y += GTile.TILE_HEIGHT / 2;
		
		return coords;
	}
	
	this.getTileCoordsAtPoint = function (x, y) {
		
		// Find Offset coordinates (based on rectangle approximation)
		var rectRow = Math.floor(y / GTile.TILE_VOFFSET);
		var rectColumn = Math.floor( (x - (rectRow % 2) * GTile.TILE_HOFFSET) / GTile.TILE_WIDTH );
		
		// Used conversion: http://www.redblobgames.com/grids/hexagons/#conversions
		// Modified to use it with the current coordinate system.
		var cubeY = rectColumn + (rectRow + (rectRow & 1)) / 2;
		var cubeZ = rectRow;
		
		
		// x,y offset relative to rectangle tile.
		var localX = x - rectColumn * GTile.TILE_WIDTH - (rectRow % 2) * GTile.TILE_HOFFSET;
		var localY = y - rectRow * GTile.TILE_VOFFSET;
		
		// Find if clicked over this hex, or the adjacent top left/right one.
		
		// Use a line equation imitating the /\ form of the top of the hex.
		// Similar to: http://www.gdreflections.com/2011/02/hexagonal-grid-math.html
		var isInside = localY > -GTile.TILE_SIDE_SLOPE * Math.abs(GTile.TILE_WIDTH / 2 - localX);		
		if (!isInside) {
			--cubeZ;
			
			if (localX < GTile.TILE_WIDTH / 2) {
				--cubeY;
			}
		}
		
		
		return {
			row: cubeZ,
			column: cubeY
		}
	}
	
	//
	// Initialize
	//
	
	// TODO: Fix this issue with height = 0 on startup
	setTimeout(function () {
		plotContainerScroller = new iScroll(self.$pnWorldPlot[0], {
			lockDirection: false,
			hideScrollbar: true,
			bounce: false,
		});
	}, 1);
}
