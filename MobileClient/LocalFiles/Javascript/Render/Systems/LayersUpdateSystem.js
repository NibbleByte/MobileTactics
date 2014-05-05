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

	var refreshLayer = function (layer) {

		// Needed only when using canvas
		if (!layer.useCanvas)
			return;

		layer.clear();

		var sprites = m_renderer.spriteTracker.layerSprites[layer.name];
		if (sprites) {
			for(var i = 0; i < sprites.length; ++i) {
				var sprite = sprites[i];

				if (sprite.img && !sprite.skipDrawing) {
					sprite.update();
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