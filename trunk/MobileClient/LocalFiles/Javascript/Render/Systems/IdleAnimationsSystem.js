//===============================================
// IdleAnimationsSystem
// Deals with idle animations.
//===============================================
"use strict";

var IdleAnimationsSystem = function () {
	var self = this;
	
	var RANDOM_IDLE_ANIMATION_INTERVAL = 4000;
	var IDLE_ANIMATION_PATTERN = /Idle\d+/i
				
	//
	// Entity system initialize
	//
	this.onAdded = function () {
		m_eworld = this.getEntityWorld();
		
		m_entityFilter = new ECS.EntityComponentFilter(m_eworld, [CUnitRendering, CAnimations]);
		
		timer = setInterval(startRandomIdleAnimation, RANDOM_IDLE_ANIMATION_INTERVAL);
	}
	
	this.onRemoved = function () {
		clearInterval(timer);
		timer = null;
		
		m_entityFilter.destroy();
		m_entityFilter = null;
		m_eworld = null;
	}
	
	//
	// Private
	//
	var m_eworld = null;
	var m_entityFilter = null;
	
	var timer = null;
	
	var startRandomIdleAnimation = function () {
		
		if (m_entityFilter.entities.length == 0)
			return;
		
		var index = Math.floor(Math.random() * m_entityFilter.entities.length);
		var entity = m_entityFilter.entities[index];
		
		var animator = entity.CAnimations.animators[UnitRenderingSystem.MAIN_SPRITE];
		if (animator.sequenceName == 'Idle') {
			var idleIndexes = [];
			for(var i = 0; i < animator.sequences.length; ++i) {
				if (IDLE_ANIMATION_PATTERN.test(animator.sequences[i])) {
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

ECS.EntityManager.registerSystem('IdleAnimationsSystem', IdleAnimationsSystem);