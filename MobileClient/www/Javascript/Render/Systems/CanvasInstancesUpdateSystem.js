//===============================================
// CanvasInstancesUpdateSystem
// Monitor for sprites with canvasInstance changes.
//===============================================
"use strict";

var CanvasInstancesUpdateSystem = function () {
	var self = this;

	var REFRESH_PENDING_SPRITES = 'CanvasInstancesUpdateSystem.refresh_pending_sprites';
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(RenderEvents.Sprites.REFRESH_SPRITES, onRefreshSprites);
		self._eworldSB.subscribe(RenderEvents.Animations.ANIMATION_FINISHED, onAnimationFinished);

		self._eworldSB.subscribe(REFRESH_PENDING_SPRITES, refreshPendingSprites);
	}
	
	//
	// Private
	//
	var m_pendingAnimators = [];

	var refreshPendingSprites = function () {

		for(var i = 0; i < m_pendingAnimators.length; ++i) {

			// Refresh only sprites that finished animations, and has changed sequence,
			// cause no one will refresh them if paused.
			if (!m_pendingAnimators[i].finished && m_pendingAnimators[i].isPaused) {
				m_pendingAnimators[i].sprite.update();
			}
		}

		m_pendingAnimators.clear();
	}

	var onRefreshSprites = function (event, sprites) {

		m_pendingAnimators = m_pendingAnimators.concat(sprites);

		if (m_pendingAnimators.length == 1) {
			self._eworld.triggerAsync(REFRESH_PENDING_SPRITES, refreshPendingSprites);
		}
	}

	var onAnimationFinished = function (event, data) {
		
		// Mark only canvas instances for pending update.
		if (data.animator.sprite.canvasInstance)
			m_pendingAnimators.push(data.animator);

		if (m_pendingAnimators.length == 1) {
			self._eworld.triggerAsync(REFRESH_PENDING_SPRITES, refreshPendingSprites);
		}
	}
}

ECS.EntityManager.registerSystem('CanvasInstancesUpdateSystem', CanvasInstancesUpdateSystem);
SystemsUtils.supplySubscriber(CanvasInstancesUpdateSystem);