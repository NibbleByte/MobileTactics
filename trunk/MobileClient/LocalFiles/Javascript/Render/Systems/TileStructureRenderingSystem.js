//===============================================
// TileStructureRenderingSystem
// Renders structures (a special kind of tile overlay).
//===============================================
"use strict";

var TileStructureRenderingSystem = function (m_renderer) {
	var self = this;
	
	console.assert(m_renderer instanceof GameWorldRenderer, "GameWorldRenderer is required.");
	
	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._entityFilter.onEntityAddedHandler = registerTileStructure;
		self._entityFilter.onEntityRemovedHandler = unregisterTileStructure;
		self._entityFilter.addRefreshEvent(EngineEvents.World.TILE_ADDED);
		self._entityFilter.addRefreshEvent(EngineEvents.World.TILE_REMOVING);
		
		self._eworldSB.subscribe(RenderEvents.Animations.ANIMATION_FINISHED, onAnimationFinished);
		self._eworldSB.subscribe(GameplayEvents.Structures.CAPTURE_FINISHED, onRefreshStructureTile);

		var tiles = self._entityFilter.entities.slice(0);
		for(var i = 0; i < tiles.length; ++i) {
			registerTileStructure(tiles[i]);
		}
	}

	var refreshStructureTile = function (tile) {
		var sprite = tile.CTileOverlayRendering.sprite;

		if (tile.CTileOwner) {
			// If structure can be owned, apply team colors/sprites
			var owner = tile.CTileOwner.owner;
			if (owner == null) {
				SpriteColorizeManager.saturateSprite(sprite, 0);
			} else {
				SpriteColorizeManager.colorizeSprite(sprite, owner.colorHue);
			}

			self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.TerrainOverlay);
		}
	}

	var onResourcesLoaded = function (sprite, tile) {
		// If image is already loaded, assigning of the sprite might not have happened yet,
		// but it is needed for the refresh to work.
		tile.CTileOverlayRendering.sprite = sprite;

		refreshStructureTile(tile);
	}

	var onRefreshStructureTile = function (event, tile) {
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
		var animator = m_renderer.buildAnimator(terrainName, overlay.sprite);
		if (animator) {
			var animations = tile.addComponentSafe(CAnimations);

			animations.add(TileStructureRenderingSystem.OVERLAY_SPRITE_ANIMATOR, animator);
			animator.playSequence('Idle0');
		}
	}
	
	var unregisterTileStructure = function (tile) {
		
		if (tile.CAnimations) {
			tile.CAnimations.remove(TileStructureRenderingSystem.OVERLAY_SPRITE_ANIMATOR);
		}

		tile.removeComponent(CTileOverlayRendering);
	}

	var onAnimationFinished = function (event, params) {
		if (!TileStructureRenderingSystem.isStructureTile(params.entity))
			return;

		if (params.name == TileStructureRenderingSystem.OVERLAY_SPRITE_ANIMATOR)
			params.entity.CAnimations.animators[TileStructureRenderingSystem.OVERLAY_SPRITE_ANIMATOR].pauseSequence('Idle');
	}
}

TileStructureRenderingSystem.TILES_OVERLAY_SPRITE_PATH = 'Assets/Render/Images/TileOverlays/{terrainType}.png';
TileStructureRenderingSystem.OVERLAY_SPRITE_ANIMATOR = 'OverlayAnimator';
TileStructureRenderingSystem.isStructureTile = function (entity) {
	return entity.CTileRendering && entity.CTileRendering.sprite && entity.CTileTerrain && (
		entity.CTileTerrain.type == GameWorldTerrainType.Base ||
		entity.CTileTerrain.type == GameWorldTerrainType.Harbour ||
		entity.CTileTerrain.type == GameWorldTerrainType.Medical ||
		entity.CTileTerrain.type == GameWorldTerrainType.WatchTower
	)
	;
}

ECS.EntityManager.registerSystem('TileStructureRenderingSystem', TileStructureRenderingSystem);
SystemsUtils.supplyComponentFilter(TileStructureRenderingSystem, TileStructureRenderingSystem.isStructureTile);