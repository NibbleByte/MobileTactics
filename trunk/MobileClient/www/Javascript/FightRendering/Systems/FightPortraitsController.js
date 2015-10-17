//===============================================
// FightPortraitsController
// Controls portraits.
//===============================================
"use strict";

var FightPortraitsController = function (m_renderer) {
	var self = this;

	//
	// Entity system initialize
	//
	this.initialize = function () {
		
		self._entityFilter.onEntityAddedHandler = registerUnit;

		self._eworldSB.subscribe(FightRenderingEvents.Layout.LAYOUT_CHANGED, onLayoutChanged);

		self._eworldSB.subscribe(RenderEvents.Animations.ANIMATION_FINISHED, onAnimationFinished);

		self._eworldSB.subscribe(FightRenderingEvents.Animations.FIRE, onFire);
	}
	
	//
	// Private
	//

	var registerUnit = function (fightUnit) {

		renderPortraitInit(fightUnit);

	}

	var renderPortraitInit = function (fightUnit) {

		var unitRendering = fightUnit.CFightUnitRendering;
		var player = fightUnit.CFightUnit.unit.CPlayerData.player;
		var commanderName = (player.playerId == 0) ? 'Colonel' : 'Baron';

		var sprite = m_renderer.createSprite(FightRenderer.LayerTypes.Portraits);
		unitRendering.ownerPortrait = sprite;

		// TODO: get sprite according to race/commander
		var spritePath = FightPortraitsController.SPRITES_PATH;

		var resourcePath;
		var animator = m_renderer.buildAnimator(commanderName, sprite, SpriteAnimations.FightPortraits);

		// Get information depending if has animations or is still image.
		if (animator) {

			resourcePath = spritePath.replace(/{fileName}/g, animator.resourcePath);

			fightUnit.CAnimations.add(FightPortraitsController.PORTRAIT_ANIM, animator);

			animator.pauseSequence('Idle');

		} else {
			console.warn('Cannot find fight portrait skin', commanderName);
			return;
		}

		m_renderer.loadSprite(sprite, resourcePath);
		sprite.position(-1000, -1000);
			
		sprite.update();

		self._entityWorld.trigger(RenderEvents.Layers.REFRESH_LAYER, FightRenderer.LayerTypes.Portraits);
	}

	var renderPortrait = function (fightUnit, layoutData) {

		var sprite = fightUnit.CFightUnitRendering.ownerPortrait;
		sprite.setXScale(fightUnit.CFightUnit.direction);

		var unitLayout = layoutData.directionalLayout[fightUnit.CFightUnit.direction];

		sprite.position(unitLayout.portraitCenter.x, unitLayout.portraitCenter.y);

		sprite.update();

		self._entityWorld.trigger(RenderEvents.Layers.REFRESH_LAYER, FightRenderer.LayerTypes.Portraits);
	}

	var onLayoutChanged = function (fightUnit, layerData) {
		renderPortrait(fightUnit, layerData);
	}

	var onFire = function (animData, params) {
		if (!params.final)
			return;

		var unit = animData.entity;

		IdleAnimationsSystem.playRandomIdleAnimation(unit.CAnimations.animators[FightPortraitsController.PORTRAIT_ANIM]);
	}

	var onAnimationFinished = function (params) {
		if (!params.entity.hasComponents(FightPortraitsController.REQUIRED_COMPONENTS))
			return;

		if (params.name == FightPortraitsController.PORTRAIT_ANIM) {
			params.animator.pauseSequence('Idle');
		}
	}
}

FightPortraitsController.REQUIRED_COMPONENTS = [CFightUnitRendering, CAnimations];
FightPortraitsController.PORTRAIT_ANIM = AnimationSystem.getAnimationToken('FightPortrait');
FightPortraitsController.SPRITES_PATH = 'Assets-Scaled/Render/Images/FightPortraits/{fileName}';

FightPortraitsController.TOP_OFFSET = 10;

ECS.EntityManager.registerSystem('FightPortraitsController', FightPortraitsController);
SystemsUtils.supplyComponentFilter(FightPortraitsController, FightPortraitsController.REQUIRED_COMPONENTS);