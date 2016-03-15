//===============================================
// SpriteColorizer
// Colorizes images to canvas, using specific key colors.
// Caches every code combination and re-uses them.
//===============================================
"use strict";

var SpriteColorizeManager = new function () {
	var self = this;

	var DBType = {
		Colorized: 0,
		Saturated: 0,
	};
	Enums.enumerate(DBType);

	var m_originalsDB = {};
	var m_effectsDB = [];
	var m_DOMsCacheDB = [];

	m_effectsDB[DBType.Colorized] = {};
	m_effectsDB[DBType.Saturated] = {};

	m_DOMsCacheDB[DBType.Colorized] = {};
	m_DOMsCacheDB[DBType.Saturated] = {};

	var convertImageToCanvas = function (image) {
		console.assert(image);

		var canvas = document.createElement('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		canvas.getContext("2d").drawImage(image, 0, 0);

		return canvas;
	}

	// Needed, because original sprite.img will be replaced with modified image.
	var getOriginalCanvas = function (sprite) {

		var hash = sprite.src;

		var img = m_originalsDB[hash];

		if (img == undefined) {
			
			console.assert(sprite.img instanceof HTMLImageElement);

			img = sprite.img;

			m_originalsDB[hash] = img;
		}

		return convertImageToCanvas(img);
	}

	var colorizeCanvas = function (canvas, primaryHue, secondaryHue) {

		var ctx = canvas.getContext('2d');

		var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

		var data = imgData.data;
		var len = data.length;
		var rgb = {}, hsv = {};
		for (var i = 0; i < len; i += 4) {

			// Skip if transparent
			if (data[i + 3] == 0)
				continue;

			Colors.rgb2hsvFast(data[i + 0], data[i + 1], data[i + 2], hsv);

			// If the hue is key value it should be colorized.
			// (h == 0) ==> Precision should not be a problem, according to the hsv algorithm.
			if (hsv.h == 0) {
				hsv.h = primaryHue;

				Colors.hsv2rgbFast(hsv.h, hsv.s, hsv.v, rgb);
				data[i + 0] = rgb.r;
				data[i + 1] = rgb.g;
				data[i + 2] = rgb.b;
			}
		}

		ctx.putImageData(imgData, 0, 0);
	}

	var saturateCanvas = function (canvas, primarySaturation, secondarySaturation) {

		var ctx = canvas.getContext('2d');

		var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

		var data = imgData.data;
		var len = data.length;
		var rgb = {}, hsv = {};
		for (var i = 0; i < len; i += 4) {

			// Skip if transparent
			if (data[i + 3] == 0)
				continue;

			Colors.rgb2hsvFast(data[i + 0], data[i + 1], data[i + 2], hsv);

			// If the hue is key value it should be colorized.
			// (h == 0) ==> Precision should not be a problem, according to the hsv algorithm.
			if (hsv.h == 0) {
				hsv.s = primarySaturation;

				Colors.hsv2rgbFast(hsv.h, hsv.s, hsv.v, rgb);
				data[i + 0] = rgb.r;
				data[i + 1] = rgb.g;
				data[i + 2] = rgb.b;
			}
		}

		ctx.putImageData(imgData, 0, 0);
	}

	var applyEffect = function (sprite, primary, secondary, dbType, executor) {

		// Get hash code.
		var hash = sprite.src + ':' + primary + ':' + secondary;

		if (sprite.img.__dbType == dbType && sprite.img.__hash == hash)
			return;

		var canvas = m_effectsDB[dbType][hash];

		if (canvas == undefined) {
			canvas = getOriginalCanvas(sprite);

			executor(canvas, primary, secondary);

			canvas.__dbType = dbType;
			canvas.__hash = hash;

			m_effectsDB[dbType][hash] = canvas;
		}


		if (RenderUtils.supportsDataUrl) {

			// If normal div with background image...
			if (sprite.dom && !sprite.canvasInstance) {
			
				// If reapplying the same sprite, recycle the previous one.
				// NOTE: order is important (first non-applied time).
				if (sprite.layer.options.recycleDOM) self.recycleDOM(sprite);

				// Avoid string garbage (could be big)
				if (!canvas.__uri) {
					canvas.__uri = 'url(' + canvas.toDataURL('image/png') + ')';
				}

				if (!sprite.layer.options.recycleDOM) {
					// This is much faster than having canvas equivalent elements.
					sprite.dom.style.backgroundImage = canvas.__uri;

				} else {
				
					var dom = null;


					// HACK: Caching actual dom elements and reusing them to boost loading time.
					//		 Copying the backgroundImage style property is very slow with long strings.
					if (!m_DOMsCacheDB[dbType][hash] || m_DOMsCacheDB[dbType][hash].length == 0) {
					
						dom = document.createElement('div');
						dom.style.position = 'absolute';

						dom.style.backgroundImage = canvas.__uri;

					} else {
						dom = m_DOMsCacheDB[dbType][hash].shift();
					}

					sprite.layer.dom.removeChild(sprite.dom);

					// Make sure the sprite fully refreshes the DOM element.
					dom.style.display = 'block';
					dom.className = sprite.dom.className;
					sprite.zindex = sprite.dom.style.zIndex;	// NOTE: not using sprite.zindex in the rest of the code.

					sprite.dom = dom;
					
					sprite.layer.dom.appendChild(sprite.dom);

					sprite._x_before = 0;
					sprite._y_before = 0;
					sprite._anchorX_before = 0;
					sprite._anchorY_before = 0;

					for(var key in sprite._dirty) {
						sprite._dirty[key] = true;
					}
				}
			}
		}

		
		sprite.img = canvas;
		sprite.changed = true;
		
	}

	this.recycleDOM = function (sprite) {

		if (sprite.img.__uri) {

			// HACK: Caching actual dom elements and reusing them to boost loading time.
			var cache = m_DOMsCacheDB[sprite.img.__dbType][sprite.img.__hash];
			if (!cache) {
				cache = [];
				m_DOMsCacheDB[sprite.img.__dbType][sprite.img.__hash] = cache;
			}

			cache.push(sprite.dom);
		}
	}

	var preEffects = {};
	var postEffects = {

		brightness: function (sprite, canvasContext, xoffset, yoffset, width, height, param) {

			var imgData = canvasContext.getImageData(xoffset, yoffset, width, height);

			var data = imgData.data;
			var len = data.length;
			var rgb = {}, hsv = {};
			for (var i = 0; i < len; i += 4) {

				// Skip if transparent
				if (data[i + 3] == 0)
					continue;

				// NOTE: "+ 20" is so black pixels are affected by brightness as well.
				data[i + 0] = (data[i + 0] + 20) * param;
				data[i + 1] = (data[i + 1] + 20) * param;
				data[i + 2] = (data[i + 2] + 20) * param;
			}

			canvasContext.putImageData(imgData, 0, 0);
		}
	};


	this.colorizeSprite = function (sprite, primaryHue, secondaryHue) {
		applyEffect(sprite, primaryHue, secondaryHue, DBType.Colorized, colorizeCanvas);
	}

	this.saturateSprite = function (sprite, primarySaturation, secondarySaturation) {
		applyEffect(sprite, primarySaturation, secondarySaturation, DBType.Saturated, saturateCanvas);
	}

	// Set post brightness effect. 1 is default.
	// Uses CSS filter property. If not supported, falls back to canvas post effects.
	this.setSpriteBrightness = function (sprite, value) {

		if (RenderUtils.supportsFilter) {
			// NOTE: contrast is used, so black pixels are affected by brightness as well.
			RenderUtils.filterSet(sprite.dom, 'contrast(0.75) brightness(' + value + ')');

		} else {
			sprite.postCanvasEffects.push({
				handler: postEffects.brightness,
				param: value,
			});
		}
	}
	
	this.clearSpriteBrightness = function (sprite) {

		if (RenderUtils.supportsFilter) {
			RenderUtils.filterSet(sprite.dom, '');

		} else {
			sprite.postCanvasEffects.findRemove(function (effect) {
				return effect.handler == postEffects.brightness;
			});
		}
	}
};