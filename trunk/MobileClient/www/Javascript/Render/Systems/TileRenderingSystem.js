//===============================================
// TileRenderingSystem
// Handles tile rendering.
//===============================================
"use strict";

var TileRenderingSystem = function (m_renderer, renderHighlight, renderActionFog, renderVisibilityFog) {
	var self = this;
	
	console.assert(m_renderer instanceof SceneRenderer, "SceneRenderer is required.");
	
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
		
		m_renderer.$pnScenePlot.on('tap', onTap);
	}

	this.uninitialize = function () {
		m_renderer.$pnScenePlot.off('tap', onTap);

		if (detailedInputEvents) {
			$(m_renderer.scene.dom).off('touchstart', onPlotTouchMove);
			$(m_renderer.scene.dom).off('touchmove', onPlotTouchMove);
			$(m_renderer.scene.dom).off('touchend', onPlotTouchMove);
			$(m_renderer.scene.dom).off('mousedown', onPlotMouseMove);
			$(m_renderer.scene.dom).off('mousemove', onPlotMouseMove);
			$(m_renderer.scene.dom).off('mouseup', onPlotMouseMove);
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
				$(m_renderer.scene.dom).on('touchend', onPlotTouchMove);
			} else {
				$(m_renderer.scene.dom).mousedown(onPlotMouseMove);
				$(m_renderer.scene.dom).mousemove(onPlotMouseMove);
				$(m_renderer.scene.dom).mouseup(onPlotMouseMove);
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
		tile.CTileRendering.sprite.depth = coords.y;
	}
	


	// Avoid creating object every time.
	var clickedEventDataCache = { tile: null, row: 0, column: 0, event: null };

	// It is just the same code for all events...
	var extractClickedTileFromEvent = function (event, opt_target) {
		var userZoom = m_renderer.plotContainerScroller.scale;
		var padding = GTile.LAYERS_PADDING * DisplayManager.zoom * userZoom;

		// Use pageX && pageY because they are normalized by jQuery. FFox doesn't provide offsetX && offsetY.
		var offset = (opt_target) ? $(opt_target).offset() : $(event.currentTarget).offset();
		var posX = event.pageX - offset.left - padding;
		var posY = event.pageY - offset.top - padding;

		posX /= DisplayManager.zoom;
		posY /= DisplayManager.zoom;

		posX /= userZoom;
		posY /= userZoom;

		m_renderer.getTileCoordsAtPoint(posX, posY, clickedEventDataCache);
		clickedEventDataCache.tile = m_world.getTile(clickedEventDataCache.row, clickedEventDataCache.column);
		return clickedEventDataCache;
	}

	var onTap = function (event) {

		// NOTE: iScroll did not pass the original event originalInputEvent. 
		//		 It was modified to do so, so one can get the touch/click position.
		var eventOrig = event.originalEvent.originalInputEvent;
		if (eventOrig.type != 'mouseup') {	// So it is a touch event probably...
			eventOrig = eventOrig.touches[0] || eventOrig.changedTouches[0];
		}
		
		var hitData = extractClickedTileFromEvent(eventOrig, m_renderer.scene.dom);
		hitData.event = event;

		self._eworld.trigger(ClientEvents.Input.TILE_CLICKED, hitData);

		hitData.event = null;
	}

	var onPlotMouseMove = function (event) {
		if (event.which == 1) {	// Left mouse button

			var hitData = extractClickedTileFromEvent(event);

			// Note: hitData is the same object every time (optimization).
			if (event.type == 'mousedown')	self._eworld.trigger(ClientEvents.Input.TILE_TOUCH_DOWN, hitData);
			if (event.type == 'mousedown')	self._eworld.trigger(ClientEvents.Input.TILE_TOUCH, hitData);
			if (event.type == 'mousemove')	self._eworld.trigger(ClientEvents.Input.TILE_TOUCH, hitData);
			if (event.type == 'mouseup')	self._eworld.trigger(ClientEvents.Input.TILE_TOUCH_UP, hitData);
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


		// Note: hitData is the same object every time (optimization).
		if (event.type == 'touchstart')	self._eworld.trigger(ClientEvents.Input.TILE_TOUCH_DOWN, hitData);
		if (event.type == 'touchstart')	self._eworld.trigger(ClientEvents.Input.TILE_TOUCH, hitData);
		if (event.type == 'touchmove')	self._eworld.trigger(ClientEvents.Input.TILE_TOUCH, hitData);
		if (event.type == 'touchend')	self._eworld.trigger(ClientEvents.Input.TILE_TOUCH_UP, hitData);
	}
	
	var addCurrentTiles = function () {
		
		m_renderer.extentWidth = 0;
		m_renderer.extentHeight = 0;
		
		m_world.iterateAllTiles(function(tile){
			onTileAdded(tile);
		});
		
		// Plot size
		m_renderer.extentWidth += GTile.LAYERS_PADDING * 2;
		m_renderer.extentHeight += GTile.LAYERS_PADDING * 2;
		
		m_renderer.refresh();
	}
	
	var createTileSprite = function (resourcePath, layerType) {
		
		var sprite = m_renderer.createSprite(layerType, resourcePath)
		.size(GTile.TILE_WIDTH, GTile.TILE_HEIGHT);
		
		return sprite;
	}
	
	var onTileAdded = function(tile) {
		
		tile.addComponent(CTileRendering);

		if (Utils.assert(tile.CTileTerrain.skin >= 0, 'Invalid terrain skin: ' + tile.CTileTerrain.skin + ' for type: ' + tile.CTileTerrain.type))
			return;

		var terrainName = GameWorldTerrainSkin[tile.CTileTerrain.type][tile.CTileTerrain.skin];
		var spritePath = TileRenderingSystem.TILES_SPRITE_PATH.replace(/{terrainSkin}/g, terrainName);
		
		// Setup sprites.
		tile.CTileRendering.sprite = createTileSprite(spritePath, WorldLayers.LayerTypes.Terrain);
		if (renderHighlight)
			tile.CTileRendering.spriteHighlight = createTileSprite(CTileRendering.getSpritePath(CTileRendering.HighlightType.Move), WorldLayers.LayerTypes.Highlights);
		if (renderActionFog)
			tile.CTileRendering.spriteActionFog = createTileSprite(TileRenderingSystem.ACTION_FOG_SPRITE_PATH, WorldLayers.LayerTypes.ActionFog);
		if (renderVisibilityFog && !RenderUtils.supportsFilter)
			tile.CTileRendering.spriteVisibilityFog = createTileSprite(TileRenderingSystem.VISIBILITY_FOG_SPRITE_PATH, WorldLayers.LayerTypes.VisibilityFog);
		
		if (renderHighlight)
			tile.CTileRendering.unHighlight();
		if (renderActionFog)
			tile.CTileRendering.hideActionFog();
		
		renderTile(tile);
				
		var sprite = tile.CTileRendering.sprite;

		// Add animation
		var animator = m_renderer.buildAnimator(terrainName, sprite, SpriteAnimations.World);
		if (animator) {

			tile.addComponentSafe(CAnimations, function (animations) {
				animations.add(TileRenderingSystem.TILES_ANIM, animator);

				// NOTE: This should be here, so anyone outside can change the animation after adding CAnimations.
				animator.pauseSequence('Idle');
			});

		}
		
		// Resize plot
		var resized = false;
		if (sprite.x + GTile.TILE_WIDTH > m_renderer.extentWidth - GTile.LAYERS_PADDING) {	// NOTE: Only right padding!
			m_renderer.extentWidth = sprite.x + GTile.TILE_WIDTH + GTile.LAYERS_PADDING;
			resized = true;
		}
		if (sprite.y + GTile.TILE_HEIGHT > m_renderer.extentHeight - GTile.LAYERS_PADDING) { // NOTE: Only bottom padding!
			m_renderer.extentHeight = sprite.y + GTile.TILE_HEIGHT + GTile.LAYERS_PADDING;
			resized = true;
		}
		
		if (resized)
			m_renderer.refresh();
	}

	var onTileChanged = function (tile) {
		
		if (Utils.assert(tile.CTileTerrain.skin >= 0, 'Invalid terrain skin: ' + tile.CTileTerrain.skin + ' for type: ' + tile.CTileTerrain.type))
			return;

		var terrainName = GameWorldTerrainSkin[tile.CTileTerrain.type][tile.CTileTerrain.skin];
		var spritePath = TileRenderingSystem.TILES_SPRITE_PATH.replace(/{terrainSkin}/g, terrainName);

		if (tile.CAnimations) {
			tile.CAnimations.remove(TileRenderingSystem.TILES_ANIM);
		}
		tile.CTileRendering.sprite.remove();


		tile.CTileRendering.sprite = createTileSprite(spritePath, WorldLayers.LayerTypes.Terrain);

		renderTile(tile);

		var sprite = tile.CTileRendering.sprite;


		// Add animation
		var animator = m_renderer.buildAnimator(terrainName, sprite, SpriteAnimations.World);
		if (animator) {

			tile.addComponentSafe(CAnimations, function (animations) {
				animations.add(TileRenderingSystem.TILES_ANIM, animator);

				// NOTE: This should be here, so anyone outside can change the animation after adding CAnimations.
				animator.pauseSequence('Idle');
			});

		} else {
			tile.removeComponentSafe(CAnimations);
		}

		self._eworld.trigger(RenderEvents.Layers.SORT_DEPTH, sprite);
	}
	
	var onTileRemoving = function(tile) {

		// Unloading previous world my be slown down buy these refreshes.
		if (self._eworld.blackboard[EngineBlackBoard.World.IS_CLEARING_WORLD])
			return;
		
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
		
		m_renderer.extentWidth += GTile.LAYERS_PADDING;
		m_renderer.extentHeight += GTile.LAYERS_PADDING;
		
		m_renderer.refresh();
		
		tile.removeComponent(CTileRendering);

		if (tile.CAnimations) {
			tile.CAnimations.remove(TileRenderingSystem.TILES_ANIM);
		}
	}
	
	var onGameLoaded = function () {
		// First sort all sprites, so it doesn't matter which is in which layer actually.
		self._eworld.trigger(RenderEvents.Layers.SORT_DEPTH_ALL);

		self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.Highlights);
		self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.ActionFog);
		self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.VisibilityFog);
	}
}

TileRenderingSystem.setTileVisibilityFog = function(tile, show) {
	
	tile.CTileRendering.viewerVisible = !show;

	if (!RenderUtils.supportsFilter) {
		
		if (show)
			tile.CTileRendering.showVisibilityFog();
		else
			tile.CTileRendering.hideVisibilityFog();
			
	} else {
		
		if (show) {
			$(tile.CTileRendering.sprite.dom).addClass('visibility_fog_filter');
		} else {
			$(tile.CTileRendering.sprite.dom).removeClass('visibility_fog_filter');
		}
	}
}

TileRenderingSystem.TILES_ANIM = AnimationSystem.getAnimationToken('Tile');
TileRenderingSystem.TILES_SPRITE_PATH = 'Assets-Scaled/Render/Images/Tiles/{terrainSkin}.png';
TileRenderingSystem.ACTION_FOG_SPRITE_PATH = 'Assets-Scaled/Render/Images/ActionHexFog.png';
TileRenderingSystem.VISIBILITY_FOG_SPRITE_PATH = 'Assets-Scaled/Render/Images/VisibilityHexFog.png';

ECS.EntityManager.registerSystem('TileRenderingSystem', TileRenderingSystem);
SystemsUtils.supplySubscriber(TileRenderingSystem);
