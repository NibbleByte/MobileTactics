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
	
	this.$pnWorldPlot = $('<div id="WorldPlot"></div>');
	this.$pnLayersContainer = $('<div id="LayersContainer"></div>').appendTo(this.$pnWorldPlot);
	
	this.worldLayers = new WorldLayers(this.$pnLayersContainer);
	
	var plotContainerScroller = null;	
	
	this.refresh = function () {
		
		self.$pnLayersContainer.width(self.extentWidth);
		self.$pnLayersContainer.height(self.extentHeight);
		
		// TODO: Unneeded check, due to timeouts on initialize
		if (plotContainerScroller)
			plotContainerScroller.refresh();		
		
	}
		
	//
	// Initialize
	//
	this.$pnWorldPlot.appendTo(this.pnHolder);
	
	// TODO: Fix this issue with height = 0 on startup
	setTimeout(function () {
		plotContainerScroller = new iScroll(self.$pnWorldPlot[0], {
			lockDirection: false,
			hideScrollbar: true,
			bounce: false,
		});
	}, 1);
}
