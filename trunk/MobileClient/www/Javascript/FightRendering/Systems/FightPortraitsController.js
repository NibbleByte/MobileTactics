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

		self._eworldSB.subscribe(FightRenderingEvents.Units.UNIT_MOVED, onUnitMoved);

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

			fightUnit.CAnimations.add(FightPortraitsController.PORTRAIT_SPRITE, animator);

			animator.pauseSequence('Idle');

		} else {
			console.warn('Cannot find fight portrait skin', commanderName);
			return;
		}

		m_renderer.loadSprite(sprite, resourcePath);

		sprite.position(fightUnit.CSpatial.x, FightRenderingManager.FightFrame.top + FightPortraitsController.TOP_OFFSET);
		sprite.update();

		self._entityWorld.trigger(RenderEvents.Layers.REFRESH_LAYER, FightRenderer.LayerTypes.Portraits);
	}

	var renderPortrait = function (fightUnit) {

		var sprite = fightUnit.CFightUnitRendering.ownerPortrait;
		sprite.setXScale(-fightUnit.CFightUnit.direction);
		sprite.position(fightUnit.CSpatial.x, FightRenderingManager.FightFrame.top + FightPortraitsController.TOP_OFFSET);
		sprite.update();

		self._entityWorld.trigger(RenderEvents.Layers.REFRESH_LAYER, FightRenderer.LayerTypes.Portraits);
	}

	var onUnitMoved = function (event, fightUnit) {
		if (fightUnit.CFightUnit.state == FightUnitState.ShowingUp)
			renderPortrait(fightUnit);
	}

	var onFire = function (event, animData, params) {
		if (!params.final)
			return;

		var unit = animData.entity;

		IdleAnimationsSystem.playRandomIdleAnimation(unit.CAnimations.animators[FightPortraitsController.PORTRAIT_SPRITE]);
	}

	var onAnimationFinished = function (event, params) {
		if (!params.entity.hasComponents(FightPortraitsController.REQUIRED_COMPONENTS))
			return;

		if (params.name == FightPortraitsController.PORTRAIT_SPRITE) {
			params.animator.pauseSequence('Idle');
		}
	}
}

FightPortraitsController.REQUIRED_COMPONENTS = [CFightUnitRendering, CAnimations];
FightPortraitsController.PORTRAIT_SPRITE = 'PortraitSprite';
FightPortraitsController.SPRITES_PATH = 'Assets-Scaled/Render/Images/FightPortraits/{fileName}';

FightPortraitsController.TOP_OFFSET = 10;

ECS.EntityManager.registerSystem('FightPortraitsController', FightPortraitsController);
SystemsUtils.supplyComponentFilter(FightPortraitsController, FightPortraitsController.REQUIRED_COMPONENTS);