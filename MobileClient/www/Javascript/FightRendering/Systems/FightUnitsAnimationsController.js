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

		self._eworldSB.subscribe(RenderEvents.Animations.ANIMATION_FINISHED, onAnimationFinished);

		self._eworldSB.subscribe(FightRenderingEvents.Fight.SHOW_UP_FINISH, all2Idle);

		self._eworldSB.subscribe(FightRenderingEvents.Fight.ATTACK, onAttack);
		self._eworldSB.subscribe(FightRenderingEvents.Fight.ATTACK_FINISH, all2Idle);
		self._eworldSB.subscribe(FightRenderingEvents.Fight.END_TAUNT, onEndTaunt);

		self._eworldSB.subscribe(FightRenderingEvents.Animations.HURT, onHurt);
		self._eworldSB.subscribe(FightRenderingEvents.Animations.HURT_FINISH, onHurtFinish);
	}
	
	//
	// Private
	//
	var registerUnit = function (fightUnit) {

		var animator = fightUnit.CAnimations.animators[FightUnitsRenderingSystem.MAIN_SPRITE];

		animator.playSequence('Run');
	}


	var onAnimationFinished = function (params) {
		if (!params.entity.hasComponents(FightUnitsAnimationsController.REQUIRED_COMPONENTS))
			return;

		if (params.name == FightUnitsRenderingSystem.MAIN_SPRITE) {
			IdleAnimationsSystem.playRandomIdleAnimation(params.animator);
		}
	}

	var onAttack = function (unit) {
		var animator = unit.CAnimations.animators[FightUnitsRenderingSystem.MAIN_SPRITE];

		animator.playSequence('Attack');
	}

	var all2Idle = function () {
		for(var i = 0; i < self._entityFilter.entities.length; ++i) {
			var unit = self._entityFilter.entities[i];

			var animator = unit.CAnimations.animators[FightUnitsRenderingSystem.MAIN_SPRITE];

			if (!IdleAnimationsSystem.playsIdleAnimation(animator)) {
				IdleAnimationsSystem.playRandomIdleAnimation(animator);
			}
		}
	}

	var onEndTaunt = function (unit) {

		var animator = unit.CAnimations.animators[FightUnitsRenderingSystem.MAIN_SPRITE];

		if (animator.hasSequence('Taunt')) {
			animator.playSequence('Taunt');
		}
	}

	var onHurt = function (unit, params) {

		var animator = unit.CAnimations.animators[FightUnitsRenderingSystem.MAIN_SPRITE];

		animator.pause();
	}

	var onHurtFinish = function (unit) {

		var animator = unit.CAnimations.animators[FightUnitsRenderingSystem.MAIN_SPRITE];

		animator.play();
	}
}

FightUnitsAnimationsController.REQUIRED_COMPONENTS = [CFightUnitRendering, CAnimations];

ECS.EntityManager.registerSystem('FightUnitsAnimationsController', FightUnitsAnimationsController);
SystemsUtils.supplyComponentFilter(FightUnitsAnimationsController, FightUnitsAnimationsController.REQUIRED_COMPONENTS);