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

		if (AnimationSystem.currentTweenOwner == self)
			AnimationSystem.currentTweenOwner = null;
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

			m_dataObjects = [];

			if (AnimationSystem.currentTweenOwner == self)
				AnimationSystem.currentTweenOwner = null;
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

	var m_dataObjects = [];
	
	this.paint = function (ticker) {
		
		var nextDataObjectIndex = 0;

		self._eworld.trigger(RenderEvents.Animations.ANIMATION_BEFORE_FRAME);
	
		// Keep animations going
		for(var i = 0; i < self._entityFilter.entities.length; ++i) {
			var entity = self._entityFilter.entities[i];
			var anim = entity.CAnimations;
			
			for(var name in anim.animators) {
				var animator = anim.animators[name];
				
				if(!animator.isPaused && animator.sequenceData) {
					
					if (animator.sequenceData.events) {
						var prevFrame = animator.getCurrentFrame();
						var prevElapsedTime = animator.getCurrentElapsedTime();
						var prevTimeNormalized = animator.getCurrentNormalizedTime();
					}


					animator.next(ticker.lastTicksElapsed);

					if (nextDataObjectIndex >= m_dataObjects.length) {
						m_dataObjects.push({});
					}

					var data = m_dataObjects[nextDataObjectIndex];
					nextDataObjectIndex++;

					data.name = name;
					data.animator = animator;
					data.entity = entity;


					if (animator.sequenceData.events) {
						var nextFrame = animator.getCurrentFrame();
						var nextElapsedTime = animator.getCurrentElapsedTime();
						var nextTimeNormalized = animator.getCurrentNormalizedTime();

						for(var j = 0; j < animator.sequenceData.events.length; ++j) {
							var animEvent = animator.sequenceData.events[j];

							if (animEvent.frame !== undefined) {
								// NOTE: this doesn't work for 0th frame and animation just started.
								if (nextFrame >= animEvent.frame && prevFrame < animEvent.frame) {
									self._eworld.trigger(animEvent.event, data, animEvent.params);
								}
								continue;
							}

							if (animEvent.elapsed !== undefined) {
								if (nextElapsedTime >= animEvent.elapsed && prevElapsedTime < animEvent.elapsed) {
									self._eworld.trigger(animEvent.event, data, animEvent.params);
								}
								continue;
							}

							if (animEvent.timeNormalized !== undefined) {
								if (nextTimeNormalized >= animEvent.timeNormalized && prevTimeNormalized < animEvent.timeNormalized) {
									self._eworld.trigger(animEvent.event, data, animEvent.params);
								}
								continue;
							}
						}
					}


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


		self._eworld.trigger(RenderEvents.Animations.ANIMATION_AFTER_FRAME, m_processedAnimationsData, ticker);

		// Clean processed animators
		m_processedAnimationsData.clear();

		// Remove un-neded data objects.
		while(m_dataObjects.length > nextDataObjectIndex && m_dataObjects.length > 0) {
			m_dataObjects.pop();
		}

		if (AnimationSystem.currentTweenOwner == null) {
			AnimationSystem.currentTweenOwner = self;
		}
		if (AnimationSystem.currentTweenOwner == self && Tweener.looping) {
			Tweener.step();
		}
	}
	
}

// Use this to generate unique animation token (for CAnimations).
AnimationSystem.__nextToken = 0;
AnimationSystem.getAnimationToken = function (opt_name) {
	AnimationSystem.__nextToken++;

	return 'Animation-' + ((opt_name) ? opt_name + '-' : '') + (AnimationSystem.__nextToken - 1);
}

// Used to invoke the tweener system. Only one animation system at a given time can do that.
AnimationSystem.currentTweenOwner = null;

// HACK: Override tween own refresh mechanics. AnimationSystem will invoke updates.
Tweener.loop = function () {
	var T = Tweener;
	if (!T.looping) {
		T._ptime = Date.now();
	}
	T.looping = true;
};
window.requestAnimFrame = function () {}	// AnimationSystem will call updates instead.

ECS.EntityManager.registerSystem('AnimationSystem', AnimationSystem);
SystemsUtils.supplyComponentFilter(AnimationSystem, [CAnimations]);