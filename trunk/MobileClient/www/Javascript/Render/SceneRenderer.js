//===============================================
// SceneRenderer
// Holds the main elements needed for rendering anything.
//===============================================
"use strict";

var SceneRenderer = function (holderElement, eworld, layersDefinitions, layersOptions) {
	var self = this;
	
	console.assert(holderElement instanceof HTMLElement, "HTMLElement is required.");
	if (!layersDefinitions.layersOptions) layersDefinitions.layersOptions = {};
		
	this.pnHolder = holderElement;
	this.extentWidth = 0;
	this.extentHeight = 0;
	
	this.$pnScenePlot = $('<div class="scene_plot"></div>').appendTo(this.pnHolder);
	
	this.scene = sjs.Scene({
		parent: this.$pnScenePlot[0],
		autoPause: false,
	});
	
	this.layers = [];
	
	for(var layerName in layersDefinitions.LayerTypes) {
		var layerType = layersDefinitions.LayerTypes[layerName];
		if (!this.layers[layerType]) {
			this.layers[layerType] = this.scene.Layer(layerName, layersDefinitions.layersOptions[layerName]);
		}
	}
	

	this.spriteTracker = new SpriteTracker(this.scene);
	this.spriteTracker.spriteCreatedCallback = function (sprite) {
		eworld.trigger(RenderEvents.Sprites.SPRITE_CREATED, sprite);
	}
	this.spriteTracker.spritesRemovedCallback = function (sprites) {
		eworld.trigger(RenderEvents.Sprites.SPRITES_REMOVED, sprites);
	}
	
	// Hide the default layer as we're not using it.
	// Do it after sprite tracker as it will using it.
	$(this.scene.layers['default'].dom).hide();

	this.refresh = function () {
		
		// HACK: Resize manually the scene and layers
		$(self.scene.dom).width(self.extentWidth);
		$(self.scene.dom).height(self.extentHeight);

		for(var i = 0; i < self.layers.length; ++i) {
			var layer = self.layers[i];

			console.assert(layer.useCanvas != undefined, 'Sprite.js API changed.');

			if (layer.useCanvas) {
				$(layer.dom).attr('width', self.extentWidth);
				$(layer.dom).attr('height', self.extentHeight);
			} else {
				$(layer.dom).width(self.extentWidth);
				$(layer.dom).height(self.extentHeight);
			}
		}
	}

	this.resize = function (width, height) {
		self.extentWidth = width;
		self.extentHeight = height;
		self.refresh();
	}

	// Enhancement of Sprite.js functionality - Sprite.loadImg. It adds parameters to the UN-DOCUMENTED "onload" callback.
	this.createSprite = function (layer, resourcePath, onLoadedCallback, userParam1, userParam2, userParam3, userParam4) {
		var sprite = self.layers[layer].Sprite();

		if (layersDefinitions.SpritesDefaultDepth) {
			sprite.depth = layersDefinitions.SpritesDefaultDepth[Enums.getName(layersDefinitions.LayerTypes, layer)];
		}
		
		if (resourcePath) {
			return self.loadSprite(sprite, resourcePath, onLoadedCallback, userParam1, userParam2, userParam3, userParam4);
		} else {
			return sprite;
		}
	}

	// Enhancement of Sprite.js functionality - Sprite.loadImg. It adds parameters to the UN-DOCUMENTED "onload" callback.
	this.loadSprite = function (sprite, resourcePath, onLoadedCallback, userParam1, userParam2, userParam3, userParam4) {

		if (onLoadedCallback) {

			sprite.addOnLoadHandler(function () {
				onLoadedCallback(sprite, userParam1, userParam2, userParam3, userParam4);
			});
		}

		sprite.loadImg(resourcePath);

		return sprite;
	}

	// Builds animator if possible.
	this.buildAnimator = function (animationName, sprite) {
		if (SpriteAnimations[animationName] == undefined)
			return null;

		var animData = SpriteAnimations[animationName];
		return new Animator(animData, sprite, self.scene);
	}

	// Enhancement of Sprite.js functionality - loadImages. It adds parameters to the "OnImagesLoaded" callback.
	// resourcePaths - can be single string or array of strings.
	this.loadImages = function (resourcePaths, onLoadedCallback, userParam1, userParam2, userParam3, userParam4) {
		var images = resourcePaths;

		if (!Utils.isArray(resourcePaths))
			var images = [resourcePaths];

		self.scene.loadImages(images, function () {
			if (onLoadedCallback)
				onLoadedCallback(resourcePaths, userParam1, userParam2, userParam3, userParam4);
		});
	}



	this.destroy = function () {
		self.scene.reset();
		self.layers = [];
		self.spriteTracker = null;
		self.scene = null;

		self.$pnScenePlot.remove();
	}
}


//
// Allow API for easy using multiple onload handlers.
//
sjs.Sprite.prototype.addOnLoadHandler = function (handler) {
	this.__onloadHandlers = this.__onloadHandlers || [];

	this.__onloadHandlers.push(handler);

	// Sanity-check
	if (this.__onloadHandlers.length > 20 && !ClientUtils.isTouchDevice && this.__onloadHandlers.length < 100) {
		console.warn("There are waaay too many OnLoad handlers - " + this.__onloadHandlers.length + ". Is this sprite gonna load at all? " + this.src);
	}
}

sjs.Sprite.prototype.onload = function () {
	if (this.__onloadHandlers) {
		for(var i = 0; i < this.__onloadHandlers.length; ++i) {
			this.__onloadHandlers[i](this);
		}
	}

	delete this.__onloadHandlers;
}