//===============================================
// AnimationSystem
// Animates all the sprites.
//===============================================
"use strict";

var AnimationSystem = function (m_renderer) {
	var self = this;
	
	console.assert(m_renderer instanceof SceneRenderer, "SceneRenderer is required.");
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		m_ticker = m_renderer.scene.Ticker(paint, { tickDuration: 16, useAnimationFrame: true });
		m_ticker.run();
	}
	
	this.uninitialize = function () {
		m_ticker.pause();
	}

	this.pauseAnimations = function () {
		m_ticker.pause();
	}

	this.resumeAnimations = function () {
		m_ticker.resume();
	}
	
	//
	// Private
	//
	var m_ticker = null;

	var m_processedAnimationsData = [];	// To avoid garbage, re-use the same array.
	var m_processedAnimationsDataArg = [ m_processedAnimationsData ];
	
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
					}

					// Might get destroyed at the end of the animation.
					if (!entity.destroyed && entity.isAttached())
						m_processedAnimationsData.push(data);
				}
			}
		}


		// Some other entities might also got destroyed at the ANIMATION_FINISHED event.
		// Don't propagate them as well.
		for(var i = 0; i < m_processedAnimationsData.length; ++i) {
			if (m_processedAnimationsData[i].entity.destroyed || !m_processedAnimationsData[i].entity.isAttached())
				m_processedAnimationsData.splice(i, 1);
		}


		self._eworld.trigger(RenderEvents.Animations.ANIMATION_AFTER_FRAME, m_processedAnimationsDataArg);

		// Clean processed animators
		m_processedAnimationsData.clear();
	}
	
}

ECS.EntityManager.registerSystem('AnimationSystem', AnimationSystem);
SystemsUtils.supplyComponentFilter(AnimationSystem, [CAnimations]);