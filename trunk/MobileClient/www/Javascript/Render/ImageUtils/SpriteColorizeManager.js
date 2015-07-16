//===============================================
// SpriteColorizer
// Colorizes images to canvas, using specific key colors.
// Caches every code combination and re-uses them.
//===============================================
"use strict";

var SpriteColorizeManager = new function () {
	var self = this;

	var m_originalsDB = {};
	var m_colorizedDB = {};
	var m_saturatedDB = {};

	var SUPPORT_CSS_FILTER = RenderUtils.supports('filter');
	if (ClientUtils.isAndroid && ClientUtils.androidVersion < 4.4)
		SUPPORT_CSS_FILTER = false;	// It's all lies!!!

	var convertImageToCanvas = function (image) {
		console.assert(image);

		var canvas = document.createElement('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		canvas.getContext("2d").drawImage(image, 0, 0);

		return canvas;
	}

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

	var applyEffect = function (sprite, primary, secondary, db, executor) {

		// Get hash code.
		var hash = sprite.img.src + ':' + primary + ':' + secondary;

		var img = db[hash];

		if (img == undefined) {
			var canvas = getOriginalCanvas(sprite);

			executor(canvas, primary, secondary);

			// Using img has higher performance than canvas on some phones.
			// If toDataURL is not supported, fallback to canvases.
			if (canvas.toDataURL) {
				img = document.createElement('img');

				img.onload = function () {
					// If setting src to dataURL took time, replace the canvas instance.
					if (img == canvas && this.width != 0 && this.height != 0) {
						db[hash] = this;
						sprite.img = this;
					}

					this.onload = null;
				}

				img.src = canvas.toDataURL('image/png');

				// HACK: Some old Android 2.x doesn't support setting dataURL as src to image. Fallback to canvas.
				// Info: http://stackoverflow.com/questions/4776670/should-setting-an-image-src-to-data-url-be-available-immediately
				// Test: http://davidwalsh.name/demo/convert-canvas-image.php
				if (img.width == 0 && img.height == 0)
					img = canvas;

			} else {
				img = canvas;
			}

			db[hash] = img;
		}

		// Replace image with canvas. Don't update.
		sprite.img = img;
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

		if (SUPPORT_CSS_FILTER) {
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

		if (SUPPORT_CSS_FILTER) {
			RenderUtils.filterSet(sprite.dom, '');

		} else {
			sprite.postCanvasEffects.findRemove(function (effect) {
				return effect.handler == postEffects.brightness;
			});
		}
	}
};