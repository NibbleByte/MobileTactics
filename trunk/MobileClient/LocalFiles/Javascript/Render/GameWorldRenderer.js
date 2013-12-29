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
