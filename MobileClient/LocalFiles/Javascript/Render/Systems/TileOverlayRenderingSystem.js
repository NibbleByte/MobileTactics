//===============================================
// AnimationSystem
// Animates all the sprites.
//===============================================
"use strict";

var TileOverlayRenderingSystem = function (m_renderer) {
	var self = this;
	
	console.assert(m_renderer instanceof GameWorldRenderer, "GameWorldRenderer is required.");
	
	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._entityFilter.onEntityAddedHandler = registerTileOverlay;
		self._entityFilter.onEntityRemovedHandler = unregisterTileOverlay;
		self._entityFilter.addRefreshEvent(EngineEvents.World.TILE_ADDED);
		self._entityFilter.addRefreshEvent(EngineEvents.World.TILE_REMOVING);
		
		self._eworldSB.subscribe(RenderEvents.Animations.ANIMATION_FINISHED, onAnimationFinished);

		var tiles = self._entityFilter.entities.slice(0);
		for(var i = 0; i < tiles.length; ++i) {
			registerTileOverlay(tiles[i]);
		}
	}

	var onResourcesLoaded = function (sprite) {
		SpriteColorizeManager.colorizeSprite(sprite, 180);	// TODO: Color according team. Color gray if noone is using it.
		self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.TerrainOverlay);
	}

	var registerTileOverlay = function (tile) {
		var overlay = tile.addComponent(CTileOverlayRendering);

		var terrainName = Enums.getName(GameWorldTerrainType, tile.CTileTerrain.type);
		var spritePath = TileOverlayRenderingSystem.TILES_OVERLAY_SPRITE_PATH.replace(/{terrainType}/g, terrainName);

		overlay.sprite = m_renderer.createSprite(WorldLayers.LayerTypes.TerrainOverlay, spritePath, onResourcesLoaded)
		.size(GTile.TILE_WIDTH, GTile.TILE_HEIGHT)
		.move(tile.CTileRendering.sprite.x, tile.CTileRendering.sprite.y)
		.update();

		// Add animation
		var animator = m_renderer.buildAnimator(terrainName, overlay.sprite);
		if (animator) {
			var animations = tile.addComponentSafe(CAnimations);

			animations.add(TileOverlayRenderingSystem.OVERLAY_SPRITE_ANIMATOR, animator);
			animator.playSequence('Idle0');
		}
	}
	
	var unregisterTileOverlay = function (tile) {
		
		if (tile.CAnimations) {
			tile.CAnimations.remove(TileOverlayRenderingSystem.OVERLAY_SPRITE_ANIMATOR);
		}

		tile.removeComponent(CTileOverlayRendering);
	}

	var onAnimationFinished = function (event, params) {
		if (!TileOverlayRenderingSystem.isOverlayTile(params.entity))
			return;

		if (params.name == TileOverlayRenderingSystem.OVERLAY_SPRITE_ANIMATOR)
			params.entity.CAnimations.animators[TileOverlayRenderingSystem.OVERLAY_SPRITE_ANIMATOR].pauseSequence('Idle');
	}
}

TileOverlayRenderingSystem.TILES_OVERLAY_SPRITE_PATH = 'Assets/Render/Images/TileOverlays/{terrainType}.png';
TileOverlayRenderingSystem.OVERLAY_SPRITE_ANIMATOR = 'OverlayAnimator';
TileOverlayRenderingSystem.isOverlayTile = function (entity) {
	return entity.CTileRendering && entity.CTileRendering.sprite && entity.CTileTerrain && (
		entity.CTileTerrain.type == GameWorldTerrainType.Base ||
		entity.CTileTerrain.type == GameWorldTerrainType.Medical ||
		entity.CTileTerrain.type == GameWorldTerrainType.WatchTower
	)
	;
}

ECS.EntityManager.registerSystem('TileOverlayRenderingSystem', TileOverlayRenderingSystem);
SystemsUtils.supplyComponentFilter(TileOverlayRenderingSystem, TileOverlayRenderingSystem.isOverlayTile);