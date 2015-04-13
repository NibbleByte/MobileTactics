//===============================================
// IdleAnimationsSystem
// Deals with idle animations.
//===============================================
"use strict";

var IdleAnimationsSystem = function () {
	var self = this;
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		timer = setInterval(startRandomIdleAnimation, IdleAnimationsSystem.RANDOM_IDLE_ANIMATION_INTERVAL);
	}
	
	this.uninitialize = function () {
		clearInterval(timer);
		timer = null;
	}
	
	//
	// Private
	//
	var timer = null;
	
	var startRandomIdleAnimation = function () {

		// Don't play animations while animation is paused, or they will freeze.
		if (self._eworld.getSystem(AnimationSystem).isPaused())
			return;

		// Find only visible entities.
		var entities = [];
		for(var i = 0; i < self._entityFilter.entities.length; ++i) {
			var entity = self._entityFilter.entities[i];
			// Editor does not have CTileVisibility.
			if (!entity.CTilePlaceable.tile.CTileVisibility || entity.CTilePlaceable.tile.CTileVisibility.visible)
				entities.push(entity);
		}
		
		if (entities.length == 0)
			return;
		
		var entity = MathUtils.randomElement(entities);
		
		var animator = entity.CAnimations.animators[UnitRenderingSystem.MAIN_SPRITE];
		if (animator.sequenceName == 'Idle') {
			IdleAnimationsSystem.playRandomIdleAnimation(animator);
		}
	}
}


IdleAnimationsSystem.playRandomIdleAnimation = function (animator) {

	var idleIndexes = [];
	for(var i = 0; i < animator.sequences.length; ++i) {
		if (IdleAnimationsSystem.IDLE_ANIMATION_PATTERN.test(animator.sequences[i])) {
			idleIndexes.push(i);
		}
	}
			
			
	if (idleIndexes.length > 0) {
		animator.playSequence(animator.sequences[MathUtils.randomElement(idleIndexes)]);
	}

}

IdleAnimationsSystem.RANDOM_IDLE_ANIMATION_INTERVAL = 4000;
IdleAnimationsSystem.IDLE_ANIMATION_PATTERN = /Idle\d+/i;

ECS.EntityManager.registerSystem('IdleAnimationsSystem', IdleAnimationsSystem);
SystemsUtils.supplyComponentFilterOnly(IdleAnimationsSystem, [CUnitRendering, CAnimations]);