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
		self._entityFilter.onEntityRemovedHandler = unregisterUnit;
	}

	var renderUnitInit = function (battleUnit) {
		
		var unitRendering = battleUnit.CBattleUnitRendering;

		var spritePath = BattleFieldUnitsRenderingSystem.SPRITES_PATH.replace(/{race}/g,
			Enums.getName(Player.Races, battleUnit.CBattleUnit.unit.CPlayerData.player.race));

		var resourcePath;
		var animator = m_renderer.buildAnimator(unitRendering.skin, unitRendering.sprite);

		// Get information depending if has animations or is still image.
		if (animator) {
			var animations = battleUnit.addComponentSafe(CAnimations);

			resourcePath = spritePath.replace(/{fileName}/g, animator.resourcePath);

			animations.add(BattleFieldUnitsRenderingSystem.MAIN_SPRITE, animator);
			animator.pauseSequence('Idle');

		} else {
			resourcePath = spritePath.replace(/{fileName}/g, unitRendering.skin + '.png');
		}

		m_renderer.loadSprite(unitRendering.sprite, resourcePath, onResourcesLoaded, battleUnit);
	}

	// Apply loaded resources.
	var onResourcesLoaded = function (sprite, battleUnit) {

		SpriteColorizeManager.colorizeSprite(sprite, battleUnit.CBattleUnit.unit.CPlayerData.player.colorHue);

		renderUnit(battleUnit);
	}

	var renderUnit = function (battleUnit) {

		var unitRendering = battleUnit.CBattleUnitRendering;
		var x = battleUnit.CSpatial.x;
		var y = battleUnit.CSpatial.y;

		if (unitRendering.sprite.w) {
			unitRendering.move(
					x - unitRendering.sprite.w / 2,
					y - unitRendering.sprite.h / 2
					);

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

	var unregisterUnit = function (battleUnit) {
		
	}
}

BattleFieldUnitsRenderingSystem.MAIN_SPRITE = 'MainSprite';
BattleFieldUnitsRenderingSystem.SPRITES_PATH = 'Assets/Render/Images/Units/{race}/{fileName}';

ECS.EntityManager.registerSystem('BattleFieldUnitsRenderingSystem', BattleFieldUnitsRenderingSystem);
SystemsUtils.supplyComponentFilter(BattleFieldUnitsRenderingSystem, [CBattleUnit]);