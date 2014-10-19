//===============================================
// TileRenderingSystem
// Handles tile rendering.
//===============================================
"use strict";

var TileRenderingSystem = function (m_renderer, renderHighlight, renderActionFog, renderVisibilityFog) {
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
		self._eworldSB.subscribe(EngineEvents.World.TILE_CHANGED, onTileChanged);
		self._eworldSB.subscribe(EngineEvents.World.TILE_REMOVING, onTileRemoving);
		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADED, onGameLoaded);

		if (renderHighlight)
			initializeHighlightSprites();

		$(m_renderer.scene.dom).click(onPlotClicked);
		m_renderer.$pnWorldPlot.on('tap', onTap);
	}

	this.uninitialize = function () {
		m_renderer.$pnWorldPlot.off('tap', onTap);

		if (detailedInputEvents) {
			$(m_renderer.scene.dom).off('touchstart', onPlotTouchMove);
			$(m_renderer.scene.dom).off('touchmove', onPlotTouchMove);
			$(m_renderer.scene.dom).off('mousedown', onPlotMouseMove);
			$(m_renderer.scene.dom).off('mousemove', onPlotMouseMove);
		}
	}

	// Explicitly turn on these events, as they might cause low performance.
	var detailedInputEvents = false;
	this.enableDetailedInputEvents = function () {

		if (!detailedInputEvents) {
			// TODO: Hook move events on start and unhook them on end.
			if (ClientUtils.isTouchDevice) {
				$(m_renderer.scene.dom).on('touchstart', onPlotTouchMove);
				$(m_renderer.scene.dom).on('touchmove', onPlotTouchMove);
			} else {
				$(m_renderer.scene.dom).mousedown(onPlotMouseMove);
				$(m_renderer.scene.dom).mousemove(onPlotMouseMove);
			}

			detailedInputEvents = true;
		}
	}

	var initializeHighlightSprites = function () {

		// Pre-initialize highlight sprites, or they won't show on first load.
		// TODO: Move to a pre-caching system if available someday. Also maybe merge them in sprite sheet?
		var highlightSprites = [];
		for(var name in CTileRendering.HighlightType) {
			if (CTileRendering.HighlightType[name] != CTileRendering.HighlightType.None)
				highlightSprites.push(CTileRendering.getSpritePath(CTileRendering.HighlightType[name]));
		}

		m_renderer.loadImages(highlightSprites);
	}
	
	//
	// ---- Private ----
	//
	var m_world = null;
		
	var renderTile = function (tile) {
		var row = tile.CTile.row;
		var column = tile.CTile.column;
		
		var coords = m_renderer.getRenderedTilePosition(row, column);
		
		tile.CTileRendering.move(coords.x, coords.y);
	}
	


	// Avoid creating object every time.
	var clickedEventDataCache = { tile: null, row: 0, column: 0 };

	// It is just the same code for all events...
	var extractClickedTileFromEvent = function (event) {

		// Use pageX && pageY because they are normalized by jQuery. FFox doesn't provide offsetX && offsetY.
		var offset = $(event.currentTarget).offset();
		var posX = event.pageX - offset.left - GTile.LAYERS_PADDING;
		var posY = event.pageY - offset.top - GTile.LAYERS_PADDING;

		m_renderer.getTileCoordsAtPoint(posX, posY, clickedEventDataCache);
		clickedEventDataCache.tile = m_world.getTile(clickedEventDataCache.row, clickedEventDataCache.column);
		return clickedEventDataCache;
	}
	var onPlotClicked = function (event) {
		if (!tapped && m_renderer.plotContainerScroller.enabled)
			return;
		tapped = false;

		var hitData = extractClickedTileFromEvent(event);
		
		self._eworld.trigger(ClientEvents.Input.TILE_CLICKED, hitData);
	}

	var onPlotMouseMove = function (event) {
		if (event.which == 1) {	// Left mouse button

			var hitData = extractClickedTileFromEvent(event);

			self._eworld.trigger(ClientEvents.Input.TILE_TOUCHED, hitData);
		}
	}
	var onPlotTouchMove = function (event) {
		
		// HACK: http://uihacker.blogspot.com/2011/01/android-touchmove-event-bug.html
		if (ClientUtils.isAndroid) {
			event.preventDefault();
		}
		
		// Touches must be used! JQuery doesn't clone the touches to its event.
		// http://www.devinrolsen.com/basic-jquery-touchmove-event-setup/
		var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
		touch.currentTarget = touch.currentTarget || event.currentTarget; 
		var hitData = extractClickedTileFromEvent(touch);

		self._eworld.trigger(ClientEvents.Input.TILE_TOUCHED, hitData);
	}

	// HACK: Fixes problems with click-events while scrolling. Tapped event is fired BEFORE the click event.
	var tapped = false;
	var onTap = function (event) {
		tapped = true;
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
		
		var sprite = m_renderer.createSprite(layerType, resourcePath)
		.size(GTile.TILE_WIDTH, GTile.TILE_HEIGHT);
		$(sprite.dom).addClass('tile');
		
		return sprite;
	}
	
	var onTileAdded = function(event, tile) {
		
		tile.addComponent(CTileRendering);
		
		var terrainName = Enums.getName(GameWorldTerrainType, tile.CTileTerrain.type);
		var spritePath = TileRenderingSystem.TILES_SPRITE_PATH.replace(/{terrainType}/g, terrainName);
		
		// Setup sprites.
		tile.CTileRendering.sprite = createTileSprite(spritePath, WorldLayers.LayerTypes.Terrain);
		if (renderHighlight)
			tile.CTileRendering.spriteHighlight = createTileSprite(CTileRendering.getSpritePath(CTileRendering.HighlightType.Move), WorldLayers.LayerTypes.Highlights);
		if (renderActionFog)
			tile.CTileRendering.spriteActionFog = createTileSprite(TileRenderingSystem.ACTION_FOG_SPRITE_PATH, WorldLayers.LayerTypes.ActionFog);
		if (renderVisibilityFog)
			tile.CTileRendering.spriteVisibilityFog = createTileSprite(TileRenderingSystem.VISIBILITY_FOG_SPRITE_PATH, WorldLayers.LayerTypes.VisibilityFog);
		
		if (renderHighlight)
			tile.CTileRendering.unHighlight();
		if (renderActionFog)
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

	var onTileChanged = function (event, tile) {

		var terrainName = Enums.getName(GameWorldTerrainType, tile.CTileTerrain.type);
		var spritePath = TileRenderingSystem.TILES_SPRITE_PATH.replace(/{terrainType}/g, terrainName);

		tile.CTileRendering.sprite.loadImg(spritePath);
	}
	
	var onTileRemoving = function(event, tile) {
		
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
	
	var onGameLoaded = function (event) {
		self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.Highlights);
		self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.ActionFog);
		self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.VisibilityFog);
	}
}

TileRenderingSystem.TILES_SPRITE_PATH = 'Assets/Render/Images/Tiles/{terrainType}.png';
TileRenderingSystem.ACTION_FOG_SPRITE_PATH = 'Assets/Render/Images/ActionHexFog.png';
TileRenderingSystem.VISIBILITY_FOG_SPRITE_PATH = 'Assets/Render/Images/VisibilityHexFog.png';

ECS.EntityManager.registerSystem('TileRenderingSystem', TileRenderingSystem);
SystemsUtils.supplySubscriber(TileRenderingSystem);
