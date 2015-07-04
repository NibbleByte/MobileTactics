//===============================================
// FightTilesRenderingSystem
// 
//===============================================
"use strict";

var FightTilesRenderingSystem = function (m_renderer) {
	var self = this;

	console.assert(m_renderer instanceof SceneRenderer, "SceneRenderer is required.");
	
	var m_spriteLeft = null;
	var m_spriteRight = null;

	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(FightRenderingEvents.Fight.INITIALIZE, onInitializeFight);

		m_spriteLeft = m_renderer.createSprite(FightRenderer.LayerTypes.Tiles);
		m_spriteRight = m_renderer.createSprite(FightRenderer.LayerTypes.Tiles);

		m_spriteLeft.addOnLoadHandler(onSpriteLoaded);
		m_spriteRight.addOnLoadHandler(onSpriteLoaded);

		m_spriteRight.setXScale(-1);
	}

	var onSpriteLoaded = function () {
		
		m_spriteLeft.anchorX = m_spriteLeft.w / 2;
		m_spriteLeft.anchorY = m_spriteLeft.h / 2;
		m_spriteRight.anchorX = m_spriteRight.w / 2;
		m_spriteRight.anchorY = m_spriteRight.h / 2;

		m_spriteLeft.update();
		m_spriteRight.update();
	}

	var changeTileSprite = function (unit, sprite) {

		var tile = unit.CTilePlaceable.tile;
		var terrainName = Enums.getName(GameWorldTerrainType, tile.CTileTerrain.type);

		var spritePath = FightTilesRenderingSystem.SPRITES_PATH.replace(/{terrainType}/g, terrainName);
		sprite.loadImg(spritePath, true);
		sprite.update();
	}

	var onInitializeFight = function (event) {

		var leftUnit = self._eworld.blackboard[FightRenderingBlackBoard.Battle.LEFT_UNIT];
		var rightUnit = self._eworld.blackboard[FightRenderingBlackBoard.Battle.RIGHT_UNIT];

		changeTileSprite(leftUnit, m_spriteLeft);
		changeTileSprite(rightUnit, m_spriteRight);

		m_spriteLeft.position(FightRenderingManager.FightFrame.leftHalf, FightRenderingManager.FightFrame.bottom - FightControllerSystem.BOTTOM_OFFSET)
		m_spriteRight.position(FightRenderingManager.FightFrame.rightHalf, FightRenderingManager.FightFrame.bottom - FightControllerSystem.BOTTOM_OFFSET);

		m_spriteLeft.update();
		m_spriteRight.update();
	}

}

FightTilesRenderingSystem.MAIN_SPRITE = 'MainSprite';
FightTilesRenderingSystem.SPRITES_PATH = 'Assets-Scaled/Render/Images/FightTiles/{terrainType}.png';

ECS.EntityManager.registerSystem('FightTilesRenderingSystem', FightTilesRenderingSystem);
SystemsUtils.supplySubscriber(FightTilesRenderingSystem);