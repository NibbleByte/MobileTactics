//===============================================
// LayersUpdateSystem
// Monitor for sprite animation and if true, redraw the whole layer with its sprites.
//===============================================
"use strict";

var LayersUpdateSystem = function (m_renderer) {
	var self = this;
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(RenderEvents.Layers.REFRESH_LAYER, onRefreshLayer);
		self._eworldSB.subscribe(RenderEvents.Layers.REFRESH_ALL, onRefreshAll);

		self._eworldSB.subscribe(RenderEvents.Animations.ANIMATION_PROGRESSED, onAnimationProgressed);
		self._eworldSB.subscribe(RenderEvents.Animations.ANIMATION_FINISHED, onAnimationProgressed);
		self._eworldSB.subscribe(RenderEvents.Animations.ANIMATION_AFTER_FRAME, onAnimationAfterFrame);
	}
	
	//
	// Private
	//
	var m_layersDirty = {};

	var refreshOnLoad = function (sprite) {
		// HACK: give one frame delay, so any other "onload" handlers can be executed correctly (placeables)
		//		 and all sprites with the same image are refreshed.
		setTimeout(function () {
			self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes[sprite.layer.name]);
		}, 0);
	}

	var refreshLayer = function (layer) {

		// Needed only when using canvas
		if (!layer.useCanvas)
			return;

		layer.clear();

		var sprites = m_renderer.spriteTracker.layerSprites[layer.name];
		if (sprites) {

			// Used to refresh the layer again, in case some sprites weren't still loaded.
			var spriteToLoad = null;

			for(var i = 0; i < sprites.length; ++i) {
				var sprite = sprites[i];

				if (sprite.imgLoaded) {
					if (!sprite.skipDrawing) {
						// TODO: introduce "depth" property of the sprite, in order to control the drawing order. Highlight layer for example.
						sprite.update();
					}
				} else {

					// Set handler, when image loads to refresh layer.
					// Set it only for the first met image (any unloaded image).
					if (!spriteToLoad) {
						sprite.addOnLoadHandler(refreshOnLoad);
					}
				}
			}
		}
	}

	var onRefreshLayer = function (event, layer) {
		refreshLayer(m_renderer.layers[layer]);
	}

	var onRefreshAll = function (event) {
		for(var i = 0; i < m_renderer.layers.length; ++i)
			refreshLayer(m_renderer.layers[i]);
	}

	var onAnimationProgressed = function (event, params) {
		var sprite = params.animator.sprite;

		m_layersDirty[sprite.layer.name] = true;
	}

	var onAnimationAfterFrame = function (event) {
		for(var layerName in m_layersDirty) {
			if (m_layersDirty[layerName]) {
				
				self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes[layerName]);

				m_layersDirty[layerName] = false;
			}
		}
	}
}

ECS.EntityManager.registerSystem('LayersUpdateSystem', LayersUpdateSystem);
SystemsUtils.supplySubscriber(LayersUpdateSystem);