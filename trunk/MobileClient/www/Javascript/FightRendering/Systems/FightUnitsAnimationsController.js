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

		self._eworldSB.subscribe(FightRenderingEvents.Fight.ATTACK, onAttack);
		self._eworldSB.subscribe(FightRenderingEvents.Fight.ATTACK_FINISH, onAttackFinish);
	}
	
	//
	// Private
	//
	var registerUnit = function (fightUnit) {

		var animator = fightUnit.CAnimations.animators[FightUnitsRenderingSystem.MAIN_SPRITE];

		animator.playSequence('Run');
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

	var onAttack = function (event, unit) {
		var animator = unit.CAnimations.animators[FightUnitsRenderingSystem.MAIN_SPRITE];

		animator.playSequence('Attack');
	}

	var onAttackFinish = function (event) {
		for(var i = 0; i < self._entityFilter.entities.length; ++i) {
			var unit = self._entityFilter.entities[i];

			var animator = unit.CAnimations.animators[FightUnitsRenderingSystem.MAIN_SPRITE];

			if (!IdleAnimationsSystem.playsIdleAnimation(animator)) {
				IdleAnimationsSystem.playRandomIdleAnimation(animator);
			}
		}
	}
}

FightUnitsAnimationsController.REQUIRED_COMPONENTS = [CFightUnitRendering, CAnimations];

ECS.EntityManager.registerSystem('FightUnitsAnimationsController', FightUnitsAnimationsController);
SystemsUtils.supplyComponentFilter(FightUnitsAnimationsController, FightUnitsAnimationsController.REQUIRED_COMPONENTS);