//===============================================
// TileStructureRenderingSystem
// Renders structures colorized.
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
		self._entityFilter.addRefreshEvent(EngineEvents.World.TILE_ADDED);
		self._entityFilter.addRefreshEvent(EngineEvents.World.TILE_CHANGED);
		self._entityFilter.addRefreshEvent(EngineEvents.World.TILE_REMOVING);

		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADING, onGameLoading);
		
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
			var sprite = tiles[i].CTileRendering.sprite;

			if (sprite && sprite.imgLoaded)
				refreshStructureTile(tiles[i]);
		}
	}

	var refreshStructureTile = function (tile) {
		var sprite = tile.CTileRendering.sprite;

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

			self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.Terrain);
			self._eworld.trigger(RenderEvents.Sprites.REFRESH_SPRITES, sprite);
		}
	}

	var onRefreshStructureTile = function (tile) {
		refreshStructureTile(tile);
	}

	var registerTileStructure = function (tile) {
		
		var sprite = tile.CTileRendering.sprite;
		sprite.changeToCanvasInstance().update();
		
		if (tile.CAnimations.animators[TileRenderingSystem.TILES_SPRITE_ANIMATION].params.playIdleDirectly) {
			IdleAnimationsSystem.playRandomIdleAnimation(tile.CAnimations.animators[TileRenderingSystem.TILES_SPRITE_ANIMATION]);
		}

		if (sprite.imgLoaded) {
			refreshStructureTile(tile);
		} else {
			sprite.addOnLoadHandler(function () {
				refreshStructureTile(tile);
			});
		}
	}
}

TileStructureRenderingSystem.isStructureTile = function (entity) {
	return entity.CTileRendering &&
	entity.CTileRendering.sprite && 
	TileStructuresSystem.isStructureTile(entity);
}

ECS.EntityManager.registerSystem('TileStructureRenderingSystem', TileStructureRenderingSystem);
SystemsUtils.supplyComponentFilter(TileStructureRenderingSystem, TileStructureRenderingSystem.isStructureTile);