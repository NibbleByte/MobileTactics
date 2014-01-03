//===============================================
// TileRenderingSystem
// Handles tile rendering.
//===============================================
"use strict";

var TileRenderingSystem = function (m_renderer) {
	var self = this;
	
	console.assert(m_renderer instanceof GameWorldRenderer, "GameWorldRenderer is required.");
	
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
	
	//
	// ---- Private ----
	//
		
	var renderTile = function (tile) {
		var row = tile.CTile.row;
		var column = tile.CTile.column;
		
		var coords = m_renderer.getRenderedTilePosition(row, column);
		
		var rendering = tile.CTileRendering;
		
		rendering.sprite.position(coords.x, coords.y);
		rendering.sprite.update();
		
		rendering.spriteHighlight.position(coords.x, coords.y);
		rendering.spriteHighlight.update();
	}
	
	var onPlotClicked = function (event) {
		var offset = $(event.currentTarget).offset();
		var posX = event.clientX - offset.left - GTile.LAYERS_PADDING;
		var posY = event.clientY - offset.top - GTile.LAYERS_PADDING;
		
		var coords = m_renderer.getTileCoordsAtPoint(posX, posY);
		
		m_eworld.trigger(ClientEvents.Input.TILE_CLICKED, m_world.getTile(coords.row, coords.column));
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
		
		var terrainName = Enums.getName(GameWorldTerrainType, tile.CTileTerrain.type);
		var spritePath = TileRenderingSystem.TILES_SPRITE_PATH.replace(/{terrainType}/g, terrainName);
		
		tile.CTileRendering.sprite = m_renderer.layers[WorldLayers.LayerTypes.Terrain].Sprite(spritePath);
		tile.CTileRendering.sprite.size(GTile.TILE_WIDTH, GTile.TILE_HEIGHT)
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

TileRenderingSystem.TILES_SPRITE_PATH = 'Assets/Render/Images/Tiles/{terrainType}.png';

ECS.EntityManager.registerSystem('TileRenderingSystem', TileRenderingSystem);
