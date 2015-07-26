//===============================================
// FightTilesRenderingSystem
// 
//===============================================
"use strict";

var FightTilesRenderingSystem = function (m_renderer) {
	var self = this;

	console.assert(m_renderer instanceof SceneRenderer, "SceneRenderer is required.");

	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._entityFilter.onEntityAddedHandler = registerUnit;

		// NOTE: Not needed for now.
		//self._eworldSB.subscribe(FightRenderingEvents.Units.UNIT_MOVED, onUnitMoved);
	}

	var onSpriteLoaded = function (sprite) {
		sprite.anchorX = sprite.w / 2;
		sprite.anchorY = sprite.h / 2;
		sprite.update();

		self._entityWorld.trigger(RenderEvents.Layers.REFRESH_LAYER, FightRenderer.LayerTypes.Tiles);
	}

	var createTileSprite = function (unit) {

		var tile = unit.CTilePlaceable.tile;
		var terrainName = Enums.getName(GameWorldTerrainType, tile.CTileTerrain.type);

		var spritePath = FightTilesRenderingSystem.SPRITES_PATH.replace(/{terrainType}/g, terrainName);
		return m_renderer.createSprite(FightRenderer.LayerTypes.Tiles, spritePath, onSpriteLoaded);
	}

	var registerUnit = function (fightUnit) {
		
		var sprite = createTileSprite(fightUnit.CFightUnit.unit);

		sprite.position(-1000, FightRenderingManager.FightFrame.bottom - FightControllerSystem.BOTTOM_OFFSET);
		if (fightUnit.CFightUnit.direction == FightRenderer.DirectionType.Left) sprite.setXScale(-1);
		sprite.update();

		fightUnit.CFightUnitRendering.tileSprite = sprite;
	}

	var onUnitMoved = function (fightUnit) {
		self._entityWorld.trigger(RenderEvents.Layers.REFRESH_LAYER, FightRenderer.LayerTypes.Tiles);
	}
}

FightTilesRenderingSystem.MAIN_SPRITE = 'MainSprite';
FightTilesRenderingSystem.SPRITES_PATH = 'Assets-Scaled/Render/Images/FightTiles/{terrainType}.png';

ECS.EntityManager.registerSystem('FightTilesRenderingSystem', FightTilesRenderingSystem);
SystemsUtils.supplyComponentFilter(FightTilesRenderingSystem, [CFightUnitRendering]);