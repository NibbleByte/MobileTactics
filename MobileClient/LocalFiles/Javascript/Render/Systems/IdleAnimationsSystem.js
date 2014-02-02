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
		
		if (self._entityFilter.entities.length == 0)
			return;
		
		var index = Math.floor(Math.random() * self._entityFilter.entities.length);
		var entity = self._entityFilter.entities[index];
		
		var animator = entity.CAnimations.animators[UnitRenderingSystem.MAIN_SPRITE];
		if (animator.sequenceName == 'Idle') {
			var idleIndexes = [];
			for(var i = 0; i < animator.sequences.length; ++i) {
				if (IdleAnimationsSystem.IDLE_ANIMATION_PATTERN.test(animator.sequences[i])) {
					idleIndexes.push(i);
				}
			}
			
			
			if (idleIndexes.length > 0) {
				var index = Math.floor(Math.random() * idleIndexes.length);
				animator.playSequence(animator.sequences[idleIndexes[index]]);
			}
		}
	}
}

IdleAnimationsSystem.RANDOM_IDLE_ANIMATION_INTERVAL = 4000;
IdleAnimationsSystem.IDLE_ANIMATION_PATTERN = /Idle\d+/i;

ECS.EntityManager.registerSystem('IdleAnimationsSystem', IdleAnimationsSystem);
SystemsUtils.supplyComponentFilterOnly(IdleAnimationsSystem, [CUnitRendering, CAnimations]);