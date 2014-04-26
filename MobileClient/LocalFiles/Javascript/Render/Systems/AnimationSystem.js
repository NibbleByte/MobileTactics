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
	this.initialize = function () {
		m_ticker = m_renderer.scene.Ticker(paint, { tickDuration: 10 });
		m_ticker.run();
	}
	
	this.uninitialize = function () {
		m_ticker.pause();
	}
	
	//
	// Private
	//
	var m_renderer = renderer;
	var m_ticker = null;
	
	var paint = function (ticker) {

		self._eworld.trigger(RenderEvents.Animations.ANIMATION_BEFORE_FRAME);
	
		// Keep animations going
		for(var i = 0; i < self._entityFilter.entities.length; ++i) {
			var entity = self._entityFilter.entities[i];
			var anim = entity.CAnimations;
			
			for(var name in anim.animators) {
				var animator = anim.animators[name];
				
				if(!animator.isPaused) {
					animator.next(ticker.lastTicksElapsed);
					var data = {
						name: name,
						animator: animator,
						entity: entity,
					};

					if (animator.finished) {
						self._eworld.trigger(RenderEvents.Animations.ANIMATION_FINISHED, data);
					} else {
						self._eworld.trigger(RenderEvents.Animations.ANIMATION_PROGRESSED, data);
					}
				}
			}
		}


		self._eworld.trigger(RenderEvents.Animations.ANIMATION_AFTER_FRAME);
	}
	
}

ECS.EntityManager.registerSystem('AnimationSystem', AnimationSystem);
SystemsUtils.supplyComponentFilter(AnimationSystem, [CAnimations]);