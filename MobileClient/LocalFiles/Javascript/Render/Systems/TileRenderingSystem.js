//===============================================
// TileRenderingSystem
// Handles tile rendering.
//===============================================
"use strict";

var TileRenderingSystem = function (world, renderer) {
	var self = this;
	
	console.assert(world instanceof GameWorld, "GameWorld is required.");
	console.assert(renderer instanceof GameWorldRenderer, "GameWorldRenderer is required.");
	
	//
	// Entity system initialize
	//
	this.onAdded = function () {
		m_eworld = this.getEntityWorld();
		m_eworldSB = m_eworld.createSubscriber();
		
		m_eworldSB.subscribe(EngineEvents.World.SIZE_CHANGED, onWorldResize);
		m_eworldSB.subscribe(EngineEvents.World.TILE_CHANGED, onTileChanged);
	}
	
	this.onRemoved = function () {
		m_eworldSB.unsubscribeAll();
		m_eworldSB = null;
		m_eworld = null;
	}
	
	//
	// Fields
	//
	var m_world = world;
	var m_eworld = null;
	var m_eworldSB = null;
	
	var m_renderer = renderer;	
	
	this.fullWorldRefresh = function () {
		var rows = m_world.getRows();
		var columns = m_world.getColumns();
		
		m_renderer.extentWidth = 0;
		m_renderer.extentHeight = 0;
		
		for(var i = 0; i < rows; ++i) {
			for(var j = 0; j < columns; ++j) {
				var tile = m_world.getTile(i, j);
				
				if (tile) {
					
					tile.CTileRendering.renderAt(tile.CTile.row, tile.CTile.column);
					m_renderer.worldLayers.attachTo(WorldLayers.LayerTypes.Terrain, tile.CTileRendering.$renderedTile);
					m_renderer.worldLayers.attachTo(WorldLayers.LayerTypes.Highlights, tile.CTileRendering.$renderedHighlight);
					// TODO: Once attached, it is never detached! Cleanup.
					// TODO: On every refresh, rendered elements are re-attached again.
					
					var coords = tile.CTileRendering.getRenderedXY();
					
					// Resize plot
					if (coords.x + GTile.TILE_WIDTH > m_renderer.extentWidth)
						m_renderer.extentWidth = coords.x + GTile.TILE_WIDTH; 
					if (coords.y + GTile.TILE_HEIGHT > m_renderer.extentHeight)
						m_renderer.extentHeight = coords.y + GTile.TILE_HEIGHT; 
				}
			}
		}
		
		// Plot size
		m_renderer.extentWidth += GTile.LAYERS_PADDING * 2;
		m_renderer.extentHeight += GTile.LAYERS_PADDING * 2;
		
		m_renderer.refresh();
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
		
		m_eworld.trigger(TileRenderingSystem.Events.TILE_CLICKED, fetchTileAtPoint(posX, posY));
	}
	
	var onTileChanged = function(event, tile) {
		// TODO: Make replace older tile/add new tile. REALLY SLOW!!!!
		self.fullWorldRefresh();
	}
	
	var onWorldResize = function (event, data) {
		self.fullWorldRefresh();
	}
	
	//
	// Initialization
	//
	m_renderer.$pnLayersContainer.click(onPlotClicked);
	
	self.fullWorldRefresh();
}

ECS.EntityManager.registerSystem('TileRenderingSystem', TileRenderingSystem);

//Supported GameWorld events that user can subscribe to.
TileRenderingSystem.Events = {
		TILE_CLICKED: "tilerenderingsystem.tile_clicked",	// Arguments: event, tile
}