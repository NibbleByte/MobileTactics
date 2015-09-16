//===============================================
// TileStructureRenderingSystem
// Renders structures (a special kind of tile overlay).
//===============================================
"use strict";

var TileStructureRenderingSystem = function (m_renderer) {
	var self = this;
	
	console.assert(m_renderer instanceof SceneRenderer, "SceneRenderer is required.");
	
	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._entityFilter.onEntityAddedHandler = registerTileStructure;
		self._entityFilter.onEntityRemovedHandler = unregisterTileStructure;
		self._entityFilter.addRefreshEvent(EngineEvents.World.TILE_ADDED);
		self._entityFilter.addRefreshEvent(EngineEvents.World.TILE_CHANGED);
		self._entityFilter.addRefreshEvent(EngineEvents.World.TILE_REMOVING);

		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADING, onGameLoading);
		
		self._eworldSB.subscribe(RenderEvents.Animations.ANIMATION_FINISHED, onAnimationFinished);
		self._eworldSB.subscribe(GameplayEvents.Structures.CAPTURE_FINISHED, onRefreshStructureTile);
		self._eworldSB.subscribe(GameplayEvents.Fog.REFRESH_FOG_AFTER, refreshKnowledge);

		var tiles = self._entityFilter.entities;
		for(var i = 0; i < tiles.length; ++i) {
			registerTileStructure(tiles[i]);
		}
	}

	//
	// ---- Private ----
	//
	var m_gameState = null;

	var onGameLoading = function () {
		m_gameState = self._eworld.extract(GameState);
	}

	var refreshKnowledge = function () {

		var tiles = self._entityFilter.entities;
		for (var i = 0; i < tiles.length; ++i) {
			var sprite = tiles[i].CTileOverlayRendering.sprite;

			if (sprite && sprite.imgLoaded)
				refreshStructureTile(tiles[i]);
		}
	}

	var refreshStructureTile = function (tile) {
		var sprite = tile.CTileOverlayRendering.sprite;

		// If structure can be owned, apply team colors/sprites
		if (tile.CTileOwner) {

			var owner = tile.CTileOwner.owner;
			if (m_gameState.currentPlayer)	// If no currentPlayer, show real owner (probably in world editor).
				owner = tile.CTileOwner.knowledge[m_gameState.currentPlayer.playerId];
			if (!owner) {
				SpriteColorizeManager.saturateSprite(sprite, 0);
			} else {
				SpriteColorizeManager.colorizeSprite(sprite, owner.colorHue);
			}

			self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.TerrainOverlay);
			self._eworld.trigger(RenderEvents.Sprites.REFRESH_SPRITES, sprite);
		}
	}

	var onResourcesLoaded = function (sprite, tile) {
		// If image is already loaded, assigning of the sprite might not have happened yet,
		// but it is needed for the refresh to work.
		tile.CTileOverlayRendering.sprite = sprite;

		refreshStructureTile(tile);
	}

	var onRefreshStructureTile = function (tile) {
		refreshStructureTile(tile);
	}

	var registerTileStructure = function (tile) {
		var overlay = tile.addComponent(CTileOverlayRendering);

		var terrainName = Enums.getName(GameWorldTerrainType, tile.CTileTerrain.type);
		var spritePath = TileStructureRenderingSystem.TILES_OVERLAY_SPRITE_PATH.replace(/{terrainType}/g, terrainName);

		overlay.sprite = m_renderer.createSprite(WorldLayers.LayerTypes.TerrainOverlay, spritePath, onResourcesLoaded, tile)
		.size(GTile.TILE_WIDTH, GTile.TILE_HEIGHT)
		.move(tile.CTileRendering.sprite.x, tile.CTileRendering.sprite.y)
		.update();

		// Add animation
		var animator = m_renderer.buildAnimator(terrainName, overlay.sprite, SpriteAnimations.World);
		if (animator) {
			var animations = tile.addComponentSafe(CAnimations);

			animations.add(TileStructureRenderingSystem.OVERLAY_SPRITE_ANIMATOR, animator);

			IdleAnimationsSystem.playRandomIdleAnimation(animator);
		}
	}
	
	var unregisterTileStructure = function (tile) {
		
		if (tile.CAnimations) {
			tile.CAnimations.remove(TileStructureRenderingSystem.OVERLAY_SPRITE_ANIMATOR);
		}

		tile.removeComponent(CTileOverlayRendering);

		self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.TerrainOverlay);
	}

	var onAnimationFinished = function (params) {
		if (!TileStructureRenderingSystem.isStructureTile(params.entity))
			return;

		if (params.name == TileStructureRenderingSystem.OVERLAY_SPRITE_ANIMATOR)
			IdleAnimationsSystem.playRandomIdleAnimation(params.entity.CAnimations.animators[TileStructureRenderingSystem.OVERLAY_SPRITE_ANIMATOR]);
	}
}

TileStructureRenderingSystem.TILES_OVERLAY_SPRITE_PATH = 'Assets-Scaled/Render/Images/TileOverlays/{terrainType}.png';
TileStructureRenderingSystem.OVERLAY_SPRITE_ANIMATOR = 'OverlayAnimator';
TileStructureRenderingSystem.isStructureTile = function (entity) {
	return entity.CTileRendering &&
	entity.CTileRendering.sprite && 
	TileStructuresSystem.isStructureTile(entity);
}

ECS.EntityManager.registerSystem('TileStructureRenderingSystem', TileStructureRenderingSystem);
SystemsUtils.supplyComponentFilter(TileStructureRenderingSystem, TileStructureRenderingSystem.isStructureTile);