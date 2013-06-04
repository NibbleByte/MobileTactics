//===============================================
// GameWorldRenderer
// Renders a GameWorld onto a specified div.
//===============================================
"use strict";

var GameWorldRenderer = function (world, holderElement) {
	var self = this;
	
	console.assert(world instanceof GameWorld, "GameWorld is required.");
	console.assert(holderElement instanceof HTMLElement, "HTMLElement is required.");
		
	//
	// Events
	//
	Subscriber.makeSubscribable(this);
	
	//
	// Tiles
	//
	var m_world = world;
	var m_worldSB = world.createSubscriber();
	var m_pnHolder = holderElement;
	var m_extentWidth = 0;
	var m_extentHeight = 0;
	
	var m_$pnWorldPlot = $('<div id="WorldPlot"></div>');
	var m_$pnLayersContainer = $('<div id="LayersContainer"></div>').appendTo(m_$pnWorldPlot);
	
	var m_worldLayers = new WorldLayers(m_$pnLayersContainer);
	
	var m_plotContainerScroller = null;

	
	this.destroy = function () {
		m_worldSB.unsubscribeAll();	
	}
	
	this.getWorld = function() {
		return m_world;
	}
	
	this.fullWorldRefresh = function () {
		var rows = m_world.getRows();
		var columns = m_world.getColumns();
		
		m_extentWidth = 0;
		m_extentHeight = 0;
		
		for(var i = 0; i < rows; ++i) {
			for(var j = 0; j < columns; ++j) {
				var tile = m_world.getTile(i, j);
				
				if (tile) {
					tile.renderAttach(m_worldLayers);
					var $renderedTile = tile.getRenderedTile();
					var x = parseFloat($renderedTile.css('left'));
					var y = parseFloat($renderedTile.css('top'));
					
					// Resize plot
					if (x + GTile.TILE_WIDTH > m_extentWidth)
						m_extentWidth = x + GTile.TILE_WIDTH; 
					if (y + GTile.TILE_HEIGHT > m_extentHeight)
						m_extentHeight = y + GTile.TILE_HEIGHT; 
				}
			}
		}
		
		// Plot size
		m_$pnLayersContainer.width(m_extentWidth + GTile.LAYERS_PADDING * 2);
		m_$pnLayersContainer.height(m_extentHeight + GTile.LAYERS_PADDING * 2);
		
		// TODO: Unneeded check, due to timeouts on initialize
		if (m_plotContainerScroller)
			m_plotContainerScroller.refresh();
	}
	
	
	//
	// ---- Private ----
	//
	
	var fetchTileAtPoint = function (x, y) {
		// Source: http://www.gdreflections.com/2011/02/hexagonal-grid-math.html
	    // Tested to work only with regular hexagons.
	    
	    // Find rendered column/row
	    var it = Math.floor(x / GTile.TILE_HOFFSET);
	    var yts = y - (it % 2) * GTile.TILE_VOFFSET;
	    var jt = Math.floor(yts / GTile.TILE_HEIGHT);
	    
	    // Offset relative to rectangle-tile.
	    var xt = x - it * GTile.TILE_HOFFSET;
	    var yt = yts - jt * GTile.TILE_HEIGHT;
	    
	    // Check if inside currently selected tile.
	    var isInside = xt > GTile.TILE_SIDE * Math.abs(0.5 - yt / GTile.TILE_HEIGHT);
	    
	    // Find exact picked rendered column/row.
	    var renderedColumn = (isInside) ? it : (it - 1);
	    var renderedRow = (isInside) ? jt : (jt - renderedColumn % 2 + ((yt > GTile.TILE_HEIGHT / 2) ? 1 : 0));
	    
	    if (renderedColumn < 0 || renderedRow < 0)
	    	return null;
	    
	    //
	    // Convert drawed column/row to GameWorld column/row.  
	    //
	    
	    // Find real tile x,y
	    var tileX = GTile.TILE_HOFFSET * renderedColumn;
	    var tileY = GTile.TILE_HEIGHT * renderedRow + (renderedColumn % 2) * GTile.TILE_VOFFSET;
	    
	    var vOffset = (renderedColumn % 2) ? -GTile.TILE_VOFFSET : 0;
	    
	    // Find GameWorld column, row.
	    var column = Math.round(2 * tileX / (GTile.TILE_WIDTH + GTile.TILE_SIDE));
	    var row = (tileY - vOffset) / GTile.TILE_HEIGHT + Math.floor(column / 2);
	    
	    return m_world.getTile(row, column);
	}
	
	var onPlotClicked = function (event) {
		var offset = $(event.currentTarget).offset();
		var posX = event.clientX - offset.left - GTile.LAYERS_PADDING;
		var posY = event.clientY - offset.top - GTile.LAYERS_PADDING;
		
		$(self).trigger(GameWorldRenderer.Events.TILE_CLICKED, fetchTileAtPoint(posX, posY));
	}
	
	var onTileChanged = function(event, tile) {
		// TODO: Make replace older tile/add new tile
		self.fullWorldRefresh();
	}
	
	var onWorldResize = function (event, data) {
		self.fullWorldRefresh();
	}
	
	//
	// Placeables
	//
	var onPlaceableRegistered = function(event, placeable) {
		// TODO: Maybe separate objects from terrain plot.
		placeable.renderAttach(m_worldLayers);
	}
	
	var onPlaceableUnregistered = function(event, placeable) {
		placeable.clearRender();
	}
	
	//
	// Initialization
	//
	m_worldSB.subscribe(GameWorld.Events.SIZE_CHANGED, onWorldResize);
	m_worldSB.subscribe(GameWorld.Events.TILE_CHANGED, onTileChanged);
	
	m_worldSB.subscribe(GameWorld.Events.PLACEABLE_REGISTERED, onPlaceableRegistered);
	m_worldSB.subscribe(GameWorld.Events.PLACEABLE_UNREGISTERED, onPlaceableUnregistered);
	
	m_$pnWorldPlot.appendTo(m_pnHolder);
	m_$pnLayersContainer.click(onPlotClicked);
	
	// TODO: Fix this issue with height = 0 on startup
	setTimeout(function () {
		m_plotContainerScroller = new iScroll(m_$pnWorldPlot[0], {
			lockDirection: false,
			hideScrollbar: true,
			bounce: false,
		});
	}, 1);
	
	self.fullWorldRefresh();
}

//Supported GameWorld events that user can subscribe to.
GameWorldRenderer.Events = {
		TILE_CLICKED: "gameworldrenderer.tile_clicked",	// Arguments: event, tile
}