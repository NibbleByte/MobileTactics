//===============================================
// TileRenderingSystem
// Handles tile rendering.
//===============================================
"use strict";

var TileRenderingSystem = function (renderer) {
	var self = this;
	
	console.assert(renderer instanceof GameWorldRenderer, "GameWorldRenderer is required.");
	
	//
	// Entity system initialize
	//
	this.onAdded = function () {
		m_eworld = this.getEntityWorld();
		m_eworldSB = m_eworld.createSubscriber();
		
		m_world = m_eworld.getSystem(GameWorld);
		console.assert(m_world instanceof GameWorld, "GameWorld is required.");
		
		addCurrentTiles();
		
		m_eworldSB.subscribe(EngineEvents.World.TILE_ADDED, onTileAdded);
		m_eworldSB.subscribe(EngineEvents.World.TILE_REMOVED, onTileRemoved);
	}
	
	this.onRemoved = function () {
		m_eworldSB.unsubscribeAll();
		m_eworldSB = null;
		m_eworld = null;
	}
	
	//
	// Fields
	//
	var m_world = null;
	var m_eworld = null;
	var m_eworldSB = null;
	
	var m_renderer = renderer;
	
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
	
	var renderTile = function (tile) {
		var row = tile.CTile.row;
		var column = tile.CTile.column;
		
		var coords = m_renderer.getRenderedTilePosition(row, column);
		
		var rendering = tile.CTileRendering;
		
		rendering.sprite.position(coords.x + GTile.LAYERS_PADDING, coords.y + GTile.LAYERS_PADDING);
		rendering.sprite.update();
		
		rendering.spriteHighlight.position(coords.x + GTile.LAYERS_PADDING, coords.y + GTile.LAYERS_PADDING);
		rendering.spriteHighlight.update();
		
		/////////////////////////////////////////////////////////
		// DEBUG: Debug visualization
		
		$(rendering.sprite.dom)
		.html(	'<br />' +
				'RC: ' + row + ', ' + column +
				'<br />' +
				'X: ' + parseInt(rendering.sprite.x) +
				'<br />' +
				'Y: ' + parseInt(rendering.sprite.y));
		// DEBUG: Color every even column
		if (row % 2)
			$(rendering.sprite.dom)
			.css('background', 'url("Assets/Render/Images/hex_bluesh.png") no-repeat')
			.css('background-size', '100% 100%');
	}
	
	var onPlotClicked = function (event) {
		var offset = $(event.currentTarget).offset();
		var posX = event.clientX - offset.left - GTile.LAYERS_PADDING;
		var posY = event.clientY - offset.top - GTile.LAYERS_PADDING;
		
		m_eworld.trigger(ClientEvents.Input.TILE_CLICKED, fetchTileAtPoint(posX, posY));
	}
	
	var addCurrentTiles = function () {
		
		m_renderer.extentWidth = 0;
		m_renderer.extentHeight = 0;
		
		iterateOverTiles(function(tile){
			onTileAdded(null, tile);
		});
		
		// Plot size
		m_renderer.extentWidth += GTile.LAYERS_PADDING * 2;
		m_renderer.extentHeight += GTile.LAYERS_PADDING * 2;
		
		m_renderer.refresh();
	}
	
	var onTileAdded = function(event, tile) {
		
		tile.addComponent(CTileRendering);
		
		tile.CTileRendering.sprite = m_renderer.layers[WorldLayers.LayerTypes.Terrain].Sprite();
		$(tile.CTileRendering.sprite.dom).addClass('tile');
		
		tile.CTileRendering.spriteHighlight = m_renderer.layers[WorldLayers.LayerTypes.Highlights].Sprite();
		$(tile.CTileRendering.spriteHighlight.dom).addClass('tile_highlight');
		
		renderTile(tile);
				
		var sprite = tile.CTileRendering.sprite;
		
		// Resize plot
		var resized = false;
		if (sprite.x + GTile.TILE_WIDTH > m_renderer.extentWidth - GTile.LAYERS_PADDING * 2) {
			m_renderer.extentWidth = sprite.x + GTile.TILE_WIDTH + GTile.LAYERS_PADDING * 2;
			resized = true;
		}
		if (sprite.y + GTile.TILE_HEIGHT > m_renderer.extentHeight - GTile.LAYERS_PADDING * 2) {
			m_renderer.extentHeight = sprite.y + GTile.TILE_HEIGHT + GTile.LAYERS_PADDING * 2;
			resized = true;
		}
		
		if (resized)
			m_renderer.refresh();
	}
	
	var onTileRemoved = function(event, tile) {
		
		
		tile.CTileRendering.spriteHighlight.remove();
		tile.CTileRendering.sprite.remove();
		
		// Resize if needed...
		m_renderer.extentWidth = 0;
		m_renderer.extentHeight = 0;
		
		iterateOverTiles(function(itTile) {
			if (itTile == tile)
				return false;
			
			var sprite = itTile.CTileRendering.sprite;
			
			// Resize plot
			if (sprite.x + GTile.TILE_WIDTH > m_renderer.extentWidth)
				m_renderer.extentWidth = sprite.x + GTile.TILE_WIDTH; 
			if (sprite.y + GTile.TILE_HEIGHT > m_renderer.extentHeight)
				m_renderer.extentHeight = sprite.y + GTile.TILE_HEIGHT;
		});
		
		m_renderer.extentWidth += GTile.LAYERS_PADDING * 2;
		m_renderer.extentHeight += GTile.LAYERS_PADDING * 2;
		
		m_renderer.refresh();
		
		tile.removeComponent(CTileRendering);
	}
	
	
	
	var iterateOverTiles = function(handler) {
		var rows = m_world.getRows();
		var columns = m_world.getColumns();
				
		for(var i = 0; i < rows; ++i) {
			for(var j = 0; j < columns; ++j) {
				var tile = m_world.getTile(i, j);
				
				if (tile) {					
					if (handler(tile))
						return;
				}
			}
		}
	}
	
	//
	// Initialization
	//
	$(m_renderer.scene.dom).click(onPlotClicked);
}

ECS.EntityManager.registerSystem('TileRenderingSystem', TileRenderingSystem);
