//===============================================
// BattleFieldUnitsRenderingSystem
// Renders field.
//===============================================
"use strict";

var BattleFieldUnitsRenderingSystem = function (m_renderer) {
	var self = this;

	console.assert(m_renderer instanceof SceneRenderer, "SceneRenderer is required.");
	
	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._entityFilter.onEntityAddedHandler = registerUnit;

		self._eworldSB.subscribe(BattleRenderingEvents.Battle.INITIALIZE, onInitializeBattle);
	}

	// Clear any previous drawings
	var onInitializeBattle = function (event) {
		self._entityWorld.trigger(RenderEvents.Layers.REFRESH_LAYER, BattleFieldRenderer.LayerTypes.Units);
	}

	var renderUnitInit = function (battleUnit) {
		
		var unitRendering = battleUnit.CBattleUnitRendering;

		var spritePath = BattleFieldUnitsRenderingSystem.SPRITES_PATH.replace(/{race}/g,
			Enums.getName(Player.Races, battleUnit.CBattleUnit.unit.CPlayerData.player.race));

		var resourcePath;
		var animator = m_renderer.buildAnimator(unitRendering.skin, unitRendering.sprite);

		// Get information depending if has animations or is still image.
		if (animator) {

			battleUnit.addComponentSafe(CAnimations, function (animations) {

				resourcePath = spritePath.replace(/{fileName}/g, animator.resourcePath);

				animations.add(BattleFieldUnitsRenderingSystem.MAIN_SPRITE, animator);
			});

		} else {
			resourcePath = spritePath.replace(/{fileName}/g, unitRendering.skin + '.png');
			unitRendering.sprite.setOpacity(0.999);	// HACK: to skip FastTrack feature for static images!
		}

		m_renderer.loadSprite(unitRendering.sprite, resourcePath, onResourcesLoaded, battleUnit);
	}

	// Apply loaded resources.
	var onResourcesLoaded = function (sprite, battleUnit) {

		SpriteColorizeManager.colorizeSprite(sprite, battleUnit.CBattleUnit.unit.CPlayerData.player.colorHue);

		// Fallback for static images
		if (!battleUnit.CAnimations) {
			sprite.anchorX = sprite.w / 2;
			sprite.anchorY = sprite.h / 2;
		}

		renderUnit(battleUnit);
	}

	var renderUnit = function (battleUnit) {

		var unitRendering = battleUnit.CBattleUnitRendering;
		var x = battleUnit.CSpatial.x;
		var y = battleUnit.CSpatial.y;

		if (unitRendering.sprite.w) {

			unitRendering.sprite.setXScale(m_renderer.direction * -1);
			unitRendering.move(x, y);

			unitRendering.sprite.depth = y;
			self._eworld.trigger(RenderEvents.Layers.SORT_DEPTH, unitRendering.sprite);

		} else {
			// NOTE: Animated units automatically have sizes, while static ones need to be loaded!
			//		 This means they still cannot have a valid position.
			//		 This is why we hide them way off-screen, or they will pop at 0,0 once loaded.
			unitRendering.move(-9999, -9999);
		}
	}

	var registerUnit = function (battleUnit) {
		
		var unitRendering = battleUnit.addComponent(CBattleUnitRendering);

		unitRendering.skin = battleUnit.CBattleUnit.unit.CUnit.name;
		unitRendering.sprite = m_renderer.createSprite(BattleFieldRenderer.LayerTypes.Units);

		renderUnitInit(battleUnit);
	}
}

BattleFieldUnitsRenderingSystem.MAIN_SPRITE = 'MainSprite';
BattleFieldUnitsRenderingSystem.SPRITES_PATH = 'Assets/Render/Images/Units/{race}/{fileName}';

ECS.EntityManager.registerSystem('BattleFieldUnitsRenderingSystem', BattleFieldUnitsRenderingSystem);
SystemsUtils.supplyComponentFilter(BattleFieldUnitsRenderingSystem, [CBattleUnit]);