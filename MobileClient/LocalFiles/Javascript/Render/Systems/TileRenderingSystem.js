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
	this.initialize = function () {
		m_world = self._eworld.getSystem(GameWorld);
		console.assert(m_world instanceof GameWorld, "GameWorld is required.");
		
		addCurrentTiles();
		
		self._eworldSB.subscribe(EngineEvents.World.TILE_ADDED, onTileAdded);
		self._eworldSB.subscribe(EngineEvents.World.TILE_REMOVING, onTileRemoving);

		initializeHighlightSprites();
	}

	var initializeHighlightSprites = function () {

		// Pre-initialize highlight sprites, or they won't show on first load.
		// TODO: Move to a pre-caching system if available someday. Also maybe merge them in sprite sheet?
		var highlightSprites = [];
		for(var i = 0; i < CTileRendering.SPRITES_FILES.length; ++i) {
			if (CTileRendering.SPRITES_FILES[i])	// First one is empty.
				highlightSprites.push(CTileRendering.SPRITES_PATH.replace(/{fileName}/g, CTileRendering.SPRITES_FILES[i]));
		}

		m_renderer.scene.loadImages(highlightSprites);
	}
	
	//
	// ---- Private ----
	//
	var m_world = null;
		
	var renderTile = function (tile) {
		var row = tile.CTile.row;
		var column = tile.CTile.column;
		
		var coords = m_renderer.getRenderedTilePosition(row, column);
		
		var rendering = tile.CTileRendering;
		
		rendering.move(coords.x, coords.y);
	}
	
	var onPlotClicked = function (event) {
		var offset = $(event.currentTarget).offset();
		var posX = event.clientX - offset.left - GTile.LAYERS_PADDING;
		var posY = event.clientY - offset.top - GTile.LAYERS_PADDING;
		
		var coords = m_renderer.getTileCoordsAtPoint(posX, posY);
		
		self._eworld.trigger(ClientEvents.Input.TILE_CLICKED, m_world.getTile(coords.row, coords.column));
	}
	
	var addCurrentTiles = function () {
		
		m_renderer.extentWidth = 0;
		m_renderer.extentHeight = 0;
		
		m_world.iterateAllTiles(function(tile){
			onTileAdded(null, tile);
		});
		
		// Plot size
		m_renderer.extentWidth += GTile.LAYERS_PADDING * 2;
		m_renderer.extentHeight += GTile.LAYERS_PADDING * 2;
		
		m_renderer.refresh();
	}
	
	var createTileSprite = function (resourcePath, layerType) {
		
		var sprite = m_renderer.layers[layerType].Sprite(resourcePath);
		sprite.size(GTile.TILE_WIDTH, GTile.TILE_HEIGHT);
		$(sprite.dom).addClass('tile');
		
		return sprite;
	}
	
	var onTileAdded = function(event, tile) {
		
		tile.addComponent(CTileRendering);
		
		var terrainName = Enums.getName(GameWorldTerrainType, tile.CTileTerrain.type);
		var spritePath = TileRenderingSystem.TILES_SPRITE_PATH.replace(/{terrainType}/g, terrainName);
		
		// Setup sprites.
		tile.CTileRendering.sprite = createTileSprite(spritePath, WorldLayers.LayerTypes.Terrain);
		tile.CTileRendering.spriteHighlight = createTileSprite('', WorldLayers.LayerTypes.Highlights);
		tile.CTileRendering.spriteActionFog = createTileSprite(TileRenderingSystem.ACTION_FOG_SPRITE_PATH, WorldLayers.LayerTypes.ActionFog);
		tile.CTileRendering.spriteVisibilityFog = createTileSprite(TileRenderingSystem.VISIBILITY_FOG_SPRITE_PATH, WorldLayers.LayerTypes.VisibilityFog);
		
		tile.CTileRendering.hideActionFog();
		
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
	
	var onTileRemoving = function(event, tile) {
		
		tile.CTileRendering.detach();
		
		// Resize if needed...
		m_renderer.extentWidth = 0;
		m_renderer.extentHeight = 0;
		
		m_world.iterateAllTiles(function(itTile) {
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
	
	//
	// Initialization
	//
	$(m_renderer.scene.dom).click(onPlotClicked);
}

TileRenderingSystem.TILES_SPRITE_PATH = 'Assets/Render/Images/Tiles/{terrainType}.png';
TileRenderingSystem.ACTION_FOG_SPRITE_PATH = 'Assets/Render/Images/ActionHexFog.png';
TileRenderingSystem.VISIBILITY_FOG_SPRITE_PATH = 'Assets/Render/Images/VisibilityHexFog.png';

ECS.EntityManager.registerSystem('TileRenderingSystem', TileRenderingSystem);
SystemsUtils.supplySubscriber(TileRenderingSystem);
