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

	var convertImageToCanvas = function (image) {
		console.assert(image);

		var canvas = document.createElement("canvas");
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

	// Hue is value from 0 to 360
	this.colorizeSprite = function (sprite, primaryHue, secondaryHue) {
		// TODO: Add secondaryHue usage?

		// Get hash code.
		var hash = sprite.img.src + ':' + primaryHue + ':' + secondaryHue + '<colorize>';

		var canvas = m_colorizedDB[hash];

		if (canvas == undefined) {
			canvas = getOriginalCanvas(sprite);

			colorizeCanvas(canvas, primaryHue, secondaryHue);

			m_colorizedDB[hash] = canvas;
		}

		// Replace image with canvas. Don't update.
		sprite.img = canvas;
		sprite.changed = true;
	}

	// Saturation is value from 0 to 1
	this.saturateSprite = function (sprite, primarySaturation, secondarySaturation) {
		// TODO: Add secondarySaturation usage?

		// Get hash code.
		var hash = sprite.img.src + ':' + primarySaturation + ':' + secondarySaturation + '<saturate>';

		var canvas = m_saturatedDB[hash];

		if (canvas == undefined) {

			canvas = getOriginalCanvas(sprite);

			saturateCanvas(canvas, primarySaturation, secondarySaturation);

			m_saturatedDB[hash] = canvas;
		}

		// Replace image with canvas. Don't update.
		sprite.img = canvas;
		sprite.changed = true;
	}
};