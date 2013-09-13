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
		var hOffset = (column % 2) ? GTile.TILE_HOFFSET : 0;
		var vOffset = (column % 2) ? -GTile.TILE_VOFFSET : 0;
		
		var coords = {
				x: hOffset + Math.floor(column / 2) * (GTile.TILE_WIDTH + GTile.TILE_SIDE) + GTile.LAYERS_PADDING,
				y: vOffset + (row - Math.floor(column / 2)) * GTile.TILE_HEIGHT + GTile.LAYERS_PADDING,
		}
		
		return coords;
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
