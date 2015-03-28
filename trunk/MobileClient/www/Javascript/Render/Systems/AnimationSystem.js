//===============================================
// AnimationSystem
// Animates all the sprites.
// Manual parameter means user will call manually the paint function and no ticker will be activated.
//===============================================
"use strict";

var AnimationSystem = function (m_renderer, m_manual) {
	var self = this;
	
	console.assert(m_renderer instanceof SceneRenderer, "SceneRenderer is required.");
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		if (!m_manual) {
			m_ticker = m_renderer.scene.Ticker(self.paint, { tickDuration: 16, useAnimationFrame: true });
			m_ticker.run();
		}
	}
	
	this.uninitialize = function () {
		if (!m_manual) {
			m_ticker.pause();
		}
	}

	this.isPaused = function () {
		if (!m_manual) {
			return m_ticker.paused;
		} else {
			return false;
		}
	}

	this.pauseAnimations = function () {
		if (!m_manual && !self.isPaused()) {
			m_ticker.pause();
		}
	}

	this.resumeAnimations = function () {
		if (!m_manual && self.isPaused()) {
			m_ticker.resume();
		}
	}
	
	//
	// Private
	//
	var m_ticker = null;

	var m_processedAnimationsData = [];	// To avoid garbage, re-use the same array.
	
	this.paint = function (ticker) {

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


		self._eworld.trigger(RenderEvents.Animations.ANIMATION_AFTER_FRAME, m_processedAnimationsData);

		// Clean processed animators
		m_processedAnimationsData.clear();
	}
	
}

ECS.EntityManager.registerSystem('AnimationSystem', AnimationSystem);
SystemsUtils.supplyComponentFilter(AnimationSystem, [CAnimations]);