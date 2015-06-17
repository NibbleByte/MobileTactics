//===============================================
// FightUnitsAnimationsController
// Handles animations change on fight events.
//===============================================
"use strict";

var FightUnitsAnimationsController = function () {
	var self = this;
	
	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._entityFilter.onEntityAddedHandler = registerUnit;
		self._entityFilter.onEntityRemovedHandler = unregisterUnit;

		self._eworldSB.subscribe(RenderEvents.Animations.ANIMATION_FINISHED, onAnimationFinished);
	}
	
	//
	// Private
	//
	var registerUnit = function (fightUnit) {

		var animator = fightUnit.CAnimations.animators[FightUnitsRenderingSystem.MAIN_SPRITE];

		IdleAnimationsSystem.playRandomIdleAnimation(animator);
	}

	var unregisterUnit = function (fightUnit) {

	}


	var onAnimationFinished = function (event, params) {
		if (!params.entity.hasComponents(FightUnitsAnimationsController.REQUIRED_COMPONENTS))
			return;

		if (params.name == FightUnitsRenderingSystem.MAIN_SPRITE) {
			IdleAnimationsSystem.playRandomIdleAnimation(params.animator);
		}
	}
}

FightUnitsAnimationsController.REQUIRED_COMPONENTS = [CFightUnitRendering, CAnimations];

ECS.EntityManager.registerSystem('FightUnitsAnimationsController', FightUnitsAnimationsController);
SystemsUtils.supplyComponentFilter(FightUnitsAnimationsController, FightUnitsAnimationsController.REQUIRED_COMPONENTS);