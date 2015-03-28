//===============================================
// AnimationSystemScrollOptimizer
// Optimizes animations when scrolling (panning) the world.
//===============================================
"use strict";

var AnimationSystemScrollOptimizer = function (m_renderer, m_animationSystem) {
	var self = this;
	
	console.assert(m_renderer instanceof SceneRenderer, "SceneRenderer is required.");
	
	//
	// Entity system initialize
	//
	this.initialize = function () {

		// Don't animate stuff while panning. Seems too heavy on performance.
		if (m_renderer.plotContainerScroller && m_renderer.plotContainerScroller) {
			m_renderer.plotContainerScroller.on('scrollStart', onScrollStart);
			m_renderer.plotContainerScroller.on('scrollEnd', onScrollEnd);
		} else {
			console.warn('Optimizations unsuccessful');
		}
	}
	
	this.uninitialize = function () {
		if (m_renderer.plotContainerScroller && m_renderer.plotContainerScroller) {
			m_renderer.plotContainerScroller.off('scrollStart', onScrollStart);
			m_renderer.plotContainerScroller.off('scrollEnd', onScrollEnd);
			m_renderer.plotContainerScroller.off('scrollCancel', onScrollEnd);
		}
	}
	

	var onScrollStart = function () {
		m_animationSystem.pauseAnimations();
	}

	var onScrollEnd = function () {
		m_animationSystem.resumeAnimations();
	}
}

ECS.EntityManager.registerSystem('AnimationSystemScrollOptimizer', AnimationSystemScrollOptimizer);
SystemsUtils.supplyBasics(AnimationSystemScrollOptimizer);