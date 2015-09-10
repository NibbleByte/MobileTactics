//===============================================
// LayersUpdateSystem
// Monitor for sprite animation and if true, redraw the whole layer with its sprites.
//===============================================
"use strict";

var LayersUpdateSystem = function (m_renderer, layerTypes) {
	var self = this;

	var REFRESH_PENDING_LAYERS = 'LayersUpdateSystem.refresh_pending_layers';
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(RenderEvents.Layers.REFRESH_LAYER, onRefreshLayer);
		self._eworldSB.subscribe(RenderEvents.Layers.REFRESH_ALL, onRefreshAll);
		self._eworldSB.subscribe(RenderEvents.Layers.SORT_DEPTH, onSortByDepth);
		self._eworldSB.subscribe(RenderEvents.Layers.SORT_DEPTH_ALL, onSortByDepthAll);
		self._eworldSB.subscribe(RenderEvents.Layers.SORT_DEPTH_REFRESH, onSortByDepthRefresh);

		self._eworldSB.subscribe(REFRESH_PENDING_LAYERS, refreshPendingLayers);

		self._eworldSB.subscribe(RenderEvents.Animations.ANIMATION_AFTER_FRAME, onAnimationAfterFrame);

		for(var layerName in layerTypes) {
			m_pendingRefreshLayers[layerTypes[layerName]] = false;
		}
	}
	
	//
	// Private
	//
	var m_layersDirty = {};	// To avoid garbage, re-use the same object.
	var m_pendingRefreshLayers = [];
	var m_hasPendingRefreshes = false;
	

	var refreshOnLoad = function (sprite) {

		// Store the layer name, in case the sprite itself gets destroyed really fast after refreshing. (Editor, mouse placement)
		var layerName = sprite.layer.name;

		// HACK: give one frame delay, so any other "onload" handlers can be executed correctly (placeables)
		//		 and all sprites with the same image are refreshed.
		setTimeout(function () {
			self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, layerTypes[layerName]);
		}, 0);
	}

	var refreshLayer = function (layer) {


		// Needed only when using canvas
		if (!layer.useCanvas) {
			
			if (ClientUtils.isAndroid && ClientUtils.androidVersion >= 4.1 && ClientUtils.androidVersion <= 4.3) {
				// HACK: Sprites don't disappear on $(sprite.dom).hide(); for non-canvas layers.
				//		 This forces all sprites in this layer to redraw.
				// TEST: Select and de-select tiles, units etc.
				layer.dom.style.display = 'none'; 	 // Detach from DOM
				layer.dom.offsetHeight; 			 // Force the detach
				layer.dom.style.display = 'inherit'; // Reattach to DOM
			}

			return;
		}

		layer.clear();

		var sprites = m_renderer.spriteTracker.layerSprites[layer.name];
		if (sprites) {

			// Used to refresh the layer again, in case some sprites weren't still loaded (not all of them).
			var spritesLoading = false;

			for(var i = 0; i < sprites.length; ++i) {
				var sprite = sprites[i];

				if (sprite.imgLoaded) {
					if (!sprite.skipDrawing) {
						sprite.update();
					}
				} else {
					
					if (!sprite.src) {
						console.warn("Refreshed sprite doesn't seem to be loading. All sprites should be loading a valid resource.");
						continue;
					}

					// Set handler, when image loads to refresh layer.
					// Set it only for the first met image (any unloaded image).
					if (!spritesLoading) {
						sprite.addOnLoadHandler(refreshOnLoad);
						spritesLoading = true;
					}
				}
			}
		}
	}

	var refreshPendingLayers = function () {
		for(var i = 0; i < m_pendingRefreshLayers.length; ++i) {
			if (m_pendingRefreshLayers[i]) {
				refreshLayer(m_renderer.layers[i]);
				m_pendingRefreshLayers[i] = false;
			}
		}

		m_hasPendingRefreshes = false;
	}

	var onRefreshLayer = function (layer) {
		m_pendingRefreshLayers[layer] = true;

		if (!m_hasPendingRefreshes) {
			m_hasPendingRefreshes = true;
			self._eworld.triggerAsync(REFRESH_PENDING_LAYERS, refreshPendingLayers);
		}
	}

	var onRefreshAll = function () {
		for(var i = 0; i < m_pendingRefreshLayers.length; ++i)
			onRefreshLayer(i);
	}


	var depthSorter = function (left, right) {
		var leftDepth = left.depth || 0;
		var rightDepth = right.depth || 0;

		return leftDepth - rightDepth;
	}

	// depth is a custom field introduced to the sprite instances. Higher depth number is on top of others.
	var onSortByDepth = function (layerOrSprite) {
		if (Utils.assert(layerOrSprite instanceof sjs.Sprite || Enums.isValidValue(layerTypes, layerOrSprite)))
			return;

		var layer = (layerOrSprite instanceof sjs.Sprite) ? layerTypes[layerOrSprite.layer.name] : layerOrSprite;

		if (!layer.useCanvas)
			return;

		var sprites = m_renderer.spriteTracker.layerSprites[Enums.getName(layerTypes, layer)];
		if (sprites) {
			sprites.sort(depthSorter);
		}
	}

	var onSortByDepthAll = function () {
		for(var layerName in layerTypes) {
			onSortByDepth(layerTypes[layerName]);
		}
	}

	var onSortByDepthRefresh = function (layerOrSprite) {
		if (Utils.assert(layerOrSprite instanceof sjs.Sprite || Enums.isValidValue(layerTypes, layerOrSprite)))
			return;

		var layer = (layerOrSprite instanceof sjs.Sprite) ? layerTypes[layerOrSprite.layer.name] : layerOrSprite;

		onSortByDepth(layer);
		onRefreshLayer(layer);
	}


	var onAnimationAfterFrame = function (processedAnimationsData) {
		
		for(var i = 0; i < processedAnimationsData.length; ++i) {
			m_layersDirty[processedAnimationsData[i].animator.sprite.layer.name] = true;
		}
		
		for(var layerName in m_layersDirty) {
			if (m_layersDirty[layerName]) {
				
				self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, layerTypes[layerName]);

				m_layersDirty[layerName] = false;
			}
		}
	}
}

ECS.EntityManager.registerSystem('LayersUpdateSystem', LayersUpdateSystem);
SystemsUtils.supplySubscriber(LayersUpdateSystem);