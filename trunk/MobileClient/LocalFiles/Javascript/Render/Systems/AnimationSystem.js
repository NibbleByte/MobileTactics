//===============================================
// AnimationSystem
// Animates all the sprites.
//===============================================
"use strict";

var AnimationSystem = function (renderer) {
	var self = this;
	
	console.assert(renderer instanceof GameWorldRenderer, "GameWorldRenderer is required.");
			
	//
	// Entity system initialize
	//
	this.onAdded = function () {
		m_eworld = this.getEntityWorld();
		m_eworldSB = m_eworld.createSubscriber();
		
		m_entityFilter = new ECS.EntityComponentFilter(m_eworld, [CAnimations]);
		
		m_ticker = m_renderer.scene.Ticker(paint, { tickDuration: 10 });
		m_ticker.run();
	}
	
	this.onRemoved = function () {
		m_entityFilter.destroy();
		m_entityFilter = null;
		m_eworldSB.unsubscribeAll();
		m_eworldSB = null;
		m_eworld = null;
		
		m_ticker.pause();
	}
	
	//
	// Private
	//
	var m_eworld = null;
	var m_eworldSB = null;
	var m_entityFilter = null;
	
	var m_renderer = renderer;
	var m_ticker = null;
	
	var paint = function (ticker) {
	
		// Keep animations going
		for(var i = 0; i < m_entityFilter.entities.length; ++i) {
			var anim = m_entityFilter.entities[i].CAnimations;
			
			for(var name in anim.animators) {
				var animator = anim.animators[name];
				
				if(!animator.isPaused) {
					animator.next(ticker.lastTicksElapsed);
					
					if (animator.finished) {
						m_eworld.trigger(RenderEvents.Animations.ANIMATION_FINISHED, {
								name: name,
								entity: m_entityFilter.entities[i]
							});
					}
				}
			}
		}
	}
	
}

ECS.EntityManager.registerSystem('AnimationSystem', AnimationSystem);