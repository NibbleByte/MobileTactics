//===============================================
// BattleFieldUnitsAnimationsController
// Handles animations change on battle events.
//===============================================
"use strict";

var BattleFieldUnitsAnimationsController = function () {
	var self = this;
	
	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._entityFilter.onEntityAddedHandler = registerUnit;
		self._entityFilter.onEntityRemovedHandler = unregisterUnit;

		self._eworldSB.subscribe(BattleRenderingEvents.Battle.ATTACK, onAttack);
		self._eworldSB.subscribe(BattleRenderingEvents.Battle.DEFEND, onDefend);
		self._eworldSB.subscribe(BattleRenderingEvents.Units.UNIT_KILLED, onUnitKilled);

		self._eworldSB.subscribe(RenderEvents.Animations.ANIMATION_FINISHED, onAnimationFinished);
	}
	
	//
	// Private
	//
	var registerUnit = function (battleUnit) {

		var animator = battleUnit.CAnimations.animators[BattleFieldUnitsRenderingSystem.MAIN_SPRITE];

		IdleAnimationsSystem.playRandomIdleAnimation(animator);
	}

	var unregisterUnit = function (battleUnit) {

	}

	var changeUnitsAnimations = function (animationName) {
		var entities = self._entityFilter.entities;

		for(var i = 0; i < entities.length; ++i) {
			var entity = entities[i];

			// Skip dead units.
			if (entity.CBattleUnit.killed)
				continue;

			var animator = entity.CAnimations.animators[BattleFieldUnitsRenderingSystem.MAIN_SPRITE];

			if (animator.hasSequence(animationName)) {
				animator.playSequence(animationName);
			}
		}
	}


	var onAttack = function () {
		changeUnitsAnimations('Attack');
	}

	var onDefend = function () {
		changeUnitsAnimations('AttackDefending');
	}

	var onUnitKilled = function (battleUnit) {
		
		if (battleUnit.CAnimations) {
			var animator = battleUnit.CAnimations.animators[BattleFieldUnitsRenderingSystem.MAIN_SPRITE];

			animator.playSequence('Die');
		}
	}


	var onAnimationFinished = function (params) {
		if (!params.entity.hasComponents(BattleFieldUnitsAnimationsController.REQUIRED_COMPONENTS))
			return;

		if (params.name == BattleFieldUnitsRenderingSystem.MAIN_SPRITE) {
			IdleAnimationsSystem.playRandomIdleAnimation(params.animator);
		}
	}
}

BattleFieldUnitsAnimationsController.REQUIRED_COMPONENTS = [CBattleUnitRendering, CAnimations];

ECS.EntityManager.registerSystem('BattleFieldUnitsAnimationsController', BattleFieldUnitsAnimationsController);
SystemsUtils.supplyComponentFilter(BattleFieldUnitsAnimationsController, BattleFieldUnitsAnimationsController.REQUIRED_COMPONENTS);