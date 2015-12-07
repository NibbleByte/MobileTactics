//===============================================
// CanvasInstancesUpdateSystem
// Monitor for sprites with canvasInstance changes.
//===============================================
"use strict";

var CanvasInstancesUpdateSystem = function (m_renderer, layerTypes) {
	var self = this;

	var REFRESH_PENDING_ANIMATORS = 'CanvasInstancesUpdateSystem.refresh_pending_animators';
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(RenderEvents.Sprites.REFRESH_SPRITES, onRefreshSprites);
		self._eworldSB.subscribe(RenderEvents.Animations.ANIMATION_FINISHED, onAnimationFinished);

		self._eworldSB.subscribe(REFRESH_PENDING_ANIMATORS, refreshPendingAnimators);

		self._eworldSB.subscribe(RenderEvents.Layers.SORT_DEPTH, onSortByDepth);
		self._eworldSB.subscribe(RenderEvents.Layers.SORT_DEPTH_ALL, onSortByDepthAll);
		self._eworldSB.subscribe(RenderEvents.Layers.SORT_DEPTH_REFRESH, onSortByDepth);

	}
	
	//
	// Private
	//
	var m_pendingAnimators = [];

	var onRefreshSprites = function (sprites) {

		if (Utils.isArray(sprites)) {
			for (var i = 0; i < sprites.length; ++i) {
				if (sprites[i].canvasInstance) {
					sprites[i].update();
				}
			}
		} else {
			sprites.update();
		}

	}

	var refreshPendingAnimators = function () {

		for(var i = 0; i < m_pendingAnimators.length; ++i) {

			// Refresh only sprites that finished animations, and has changed sequence,
			// cause no one will refresh them if paused.
			if (!m_pendingAnimators[i].finished && m_pendingAnimators[i].isPaused) {
				if (!Utils.isInvalidated(m_pendingAnimators[i].sprite))
					m_pendingAnimators[i].sprite.update();
			}
		}

		m_pendingAnimators.clear();
	}

	var onAnimationFinished = function (data) {
		
		// Might happen if someone destroys it in the current ANIMATION_FINISHED event before us.
		if (Utils.isInvalidated(data.animator.sprite))
			return;
		
		// Mark only canvas instances for pending update.
		if (data.animator.sprite.canvasInstance)
			m_pendingAnimators.push(data.animator);

		if (m_pendingAnimators.length == 1) {
			self._eworld.triggerAsync(REFRESH_PENDING_ANIMATORS, refreshPendingAnimators);
		}
	}



	// depth is a custom field introduced to the sprite instances. Higher depth number is on top of others.
	var onSortByDepth = function (layerOrSprite) {
		if (Utils.assert(layerOrSprite instanceof sjs.Sprite || Enums.isValidValue(layerTypes, layerOrSprite)))
			return;

		var layer = (layerOrSprite instanceof sjs.Sprite) ? m_renderer.layers[layerTypes[layerOrSprite.layer.name]] : m_renderer.layers[layerOrSprite];

		if (layer.useCanvas)
			return;

		var sprites = m_renderer.spriteTracker.layerSprites[layer.name];

		if (sprites) {
			for(var i = 0; i < sprites.length; ++i) {
				sprites[i].dom.style.zIndex = sprites[i].depth || 0;
			}
		}
	}

	var onSortByDepthAll = function () {
		for (var layerName in layerTypes) {
			onSortByDepth(layerTypes[layerName]);
		}
	}
}

ECS.EntityManager.registerSystem('CanvasInstancesUpdateSystem', CanvasInstancesUpdateSystem);
SystemsUtils.supplySubscriber(CanvasInstancesUpdateSystem);