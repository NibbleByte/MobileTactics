//===============================================
// SpriteColorizer
// Colorizes images to canvas, using specific key colors.
// Caches every code combination and re-uses them.
//===============================================
"use strict";

var SpriteColorizeManager = new function () {
	var self = this;

	var m_colorizedDB = {};
	var m_saturatedDB = {};

	var convertImageToCanvas = function (image) {
		console.assert(image);

		var canvas = document.createElement('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		canvas.getContext("2d").drawImage(image, 0, 0);

		return canvas;
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

	var applyEffect = function (sprite, primary, secondary, db, executor) {

		// Get hash code.
		var hash = sprite.src + ':' + primary + ':' + secondary;

		var canvas = db[hash];

		if (canvas == undefined) {
			canvas = convertImageToCanvas(sprite.img);

			executor(canvas, primary, secondary);

			db[hash] = canvas;
		}


		if (RenderUtils.supportsDataUrl) {

			// If normal div with background image...
			if (sprite.dom && !sprite.canvasInstance) {
			
				// Avoid string garbage (could be big)
				if (!canvas.__uri) {
					canvas.__uri = 'url(' + canvas.toDataURL('image/png') + ')';
				}

				// This is much faster than having canvas equivalent elements.
				sprite.dom.style.backgroundImage = canvas.__uri;
			}
		}

		sprite.img = canvas;
		sprite.changed = true;
		
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
		applyEffect(sprite, primaryHue, secondaryHue, m_colorizedDB, colorizeCanvas);
	}

	this.saturateSprite = function (sprite, primarySaturation, secondarySaturation) {
		applyEffect(sprite, primarySaturation, secondarySaturation, m_saturatedDB, saturateCanvas);
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