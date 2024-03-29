//===============================================
// FightUnitsRenderingSystem
// 
//===============================================
"use strict";

var FightUnitsRenderingSystem = function (m_renderer) {
	var self = this;

	console.assert(m_renderer instanceof SceneRenderer, "SceneRenderer is required.");
	
	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._entityFilter.onEntityAddedHandler = registerUnit;

		self._eworldSB.subscribe(FightRenderingEvents.Fight.INITIALIZE, onInitializeFight);
		self._eworldSB.subscribe(FightRenderingEvents.Units.UNIT_MOVED, onUnitMoved);

		self._eworldSB.subscribe(FightRenderingEvents.Animations.DIES, onUnitDying);

		// Pre-load common images.
		m_renderer.scene.loadImages([SpriteAnimations.FightUnits.UnitDeathFight.resourcePath]);
	}

	// Clear any previous drawings
	var onInitializeFight = function () {
		self._entityWorld.trigger(RenderEvents.Layers.REFRESH_LAYER, FightRenderer.LayerTypes.Units);
	}

	var renderUnitInit = function (fightUnit) {
		
		var unitRendering = fightUnit.CFightUnitRendering;

		var spritePath = FightUnitsRenderingSystem.SPRITES_PATH.replace(/{race}/g,
			Enums.getName(Player.Races, fightUnit.CFightUnit.unit.CUnit.race));

		var resourcePath;
		var animator = m_renderer.buildAnimator(unitRendering.skin, unitRendering.sprite, SpriteAnimations.FightUnits);

		// Get information depending if has animations or is still image.
		if (animator) {

			fightUnit.addComponentSafe(CAnimations, function (animations) {

				resourcePath = spritePath.replace(/{fileName}/g, animator.resourcePath);

				animations.add(FightUnitsRenderingSystem.MAIN_ANIM, animator);
			});

		} else {
			console.warn('Cannot find Fight unit skin', unitRendering.skin);
			return;
		}

		self._eworld.blackboard[FightRenderingBlackBoard.Loading.INITIALIZE_TASKS].addTask(unitRendering.sprite);
		m_renderer.loadSprite(unitRendering.sprite, resourcePath, onResourcesLoaded, fightUnit);
	}

	// Apply loaded resources.
	var onResourcesLoaded = function (sprite, fightUnit) {

		SpriteColorizeManager.colorizeSprite(sprite, fightUnit.CFightUnit.unit.CPlayerData.player.colorHue);

		renderUnit(fightUnit);

		self._eworld.blackboard[FightRenderingBlackBoard.Loading.INITIALIZE_TASKS].removeTask(sprite);
	}

	var renderUnit = function (fightUnit) {

		var unitRendering = fightUnit.CFightUnitRendering;
		var x = fightUnit.CSpatial.x;
		var y = fightUnit.CSpatial.y;


		unitRendering.sprite.setXScale(fightUnit.CFightUnit.direction);
		unitRendering.move(x, y);

		self._entityWorld.trigger(RenderEvents.Layers.REFRESH_LAYER, FightRenderer.LayerTypes.Units);
	}

	var onUnitMoved = function (fightUnit) {
		renderUnit(fightUnit);
	}

	var onUnitDying = function (unit) {

		var dyingSprite = m_renderer.createSprite(FightRenderer.LayerTypes.Units, SpriteAnimations.FightUnits.UnitDeathFight.resourcePath);
		unit.CFightUnitRendering.dylingSprite = dyingSprite;

		var animator = new Animator(SpriteAnimations.FightUnits.UnitDeathFight, dyingSprite, m_renderer.scene);
		unit.CAnimations.add(FightUnitsRenderingSystem.DYING_ANIM, animator);

		animator.playSequence('Boom');

		renderUnit(unit);
	}

	var registerUnit = function (fightUnit) {
		
		var unitRendering = fightUnit.addComponent(CFightUnitRendering);

		unitRendering.skin = fightUnit.CFightUnit.unit.CUnit.name;
		unitRendering.sprite = m_renderer.createSprite(FightRenderer.LayerTypes.Units);

		renderUnitInit(fightUnit);
	}
}

FightUnitsRenderingSystem.MAIN_ANIM = AnimationSystem.getAnimationToken('FightUnit');
FightUnitsRenderingSystem.DYING_ANIM = AnimationSystem.getAnimationToken('FightDying');
FightUnitsRenderingSystem.SPRITES_PATH = 'Assets-Scaled/Render/Images/FightUnits/{race}/{fileName}';

ECS.EntityManager.registerSystem('FightUnitsRenderingSystem', FightUnitsRenderingSystem);
SystemsUtils.supplyComponentFilter(FightUnitsRenderingSystem, [CFightUnit]);