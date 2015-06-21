//===============================================
// SceneRenderer
// Holds the main elements needed for rendering anything.
//===============================================
"use strict";

var SceneRenderer = function (holderElement, eworld, layersDefinitions) {
	var self = this;
	
	console.assert(holderElement instanceof HTMLElement, "HTMLElement is required.");
	if (!layersDefinitions.layersOptions) layersDefinitions.layersOptions = {};
		
	this.pnHolder = holderElement;
	this.extentWidth = 0;
	this.extentHeight = 0;
	
	this.$pnScenePlot = $('<div class="scene_plot"></div>').appendTo(this.pnHolder);
	
	// Overrides scene + layers zoom globally.
	this.disableSceneZoom = false;

	this.scene = sjs.Scene({
		parent: this.$pnScenePlot[0],
		autoPause: false,
	});
	
	this.layers = [];
	
	for(var layerName in layersDefinitions.LayerTypes) {
		var layerType = layersDefinitions.LayerTypes[layerName];
		if (!this.layers[layerType]) {
			var options = layersDefinitions.layersOptions[layerName] || {};
			var layer = this.scene.Layer(layerName, options);

			layer.options = options;
			this.layers[layerType] = layer;

			if (!options.disableZoom)
				DisplayManager.zoomInElement(layer.dom);
			
			// HACK: z-index seems to distort text outlines made with text-shadow property
			//		 on Android 4.4 Kitkat (test with floating numbers).
			$(layer.dom).css('z-index', '');
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
		
		if (self.disableSceneZoom) {
			var zoomedWidth = self.extentWidth;
			var zoomedHeight = self.extentHeight;
		} else {
			var zoomedWidth = Math.ceil(self.extentWidth * DisplayManager.zoom);
			var zoomedHeight = Math.ceil(self.extentHeight * DisplayManager.zoom);
		}

		
		// HACK: Resize manually the scene and layers
		$(self.scene.dom).width(zoomedWidth);
		$(self.scene.dom).height(zoomedHeight);

		for(var i = 0; i < self.layers.length; ++i) {
			var layer = self.layers[i];

			console.assert(layer.useCanvas != undefined, 'Sprite.js API changed.');

			var canvasWidth = (layer.options.disableZoom) ? zoomedWidth : self.extentWidth;
			var canvasHeight = (layer.options.disableZoom) ? zoomedHeight : self.extentHeight;

			if (layer.useCanvas) {
				$(layer.dom).attr('width', canvasWidth);
				$(layer.dom).attr('height', canvasHeight);
			} else {
				$(layer.dom).width(canvasWidth);
				$(layer.dom).height(canvasHeight);
			}

			$(layer.dom).css('left', Math.floor((zoomedWidth - canvasWidth) / 2));
			$(layer.dom).css('top', Math.floor((zoomedHeight - canvasHeight) / 2));
		}
	}

	this.resize = function (width, height) {
		self.extentWidth = width;
		self.extentHeight = height;
		self.refresh();
	}

	this.zoomBack = function (value) {
		return value * DisplayManager.zoom;
	}
	this.zoomIn = function (value) {
		return value / DisplayManager.zoom;
	}
	this.zoomBackCoords = function (coords) {
		coords.x *= DisplayManager.zoom;
		coords.y *= DisplayManager.zoom;
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
	this.buildAnimator = function (animationName, sprite, animationDefinitions) {
		animationDefinitions = animationDefinitions || SpriteAnimations;

		if (animationDefinitions[animationName] == undefined)
			return null;

		var animData = animationDefinitions[animationName];
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

// 
// HACK: Fix issues with clearing canvas on Android 4.1-4.3
// URL: https://medium.com/@dhashvir/android-4-1-x-stock-browser-canvas-solution-ffcb939af758
//
if (ClientUtils.isAndroid && parseFloat(ClientUtils.androidVersion) >= 4.1 && parseFloat(ClientUtils.androidVersion) <= 4.3) {

	SceneRenderer.CanvasRenderingContext2D = {
		clearRect: CanvasRenderingContext2D.prototype.clearRect
	};

	CanvasRenderingContext2D.prototype.clearRect = function () {
		SceneRenderer.CanvasRenderingContext2D.clearRect.apply(this, arguments);

		this.canvas.style.display = 'none';		// Detach from DOM
		this.canvas.offsetHeight;				// Force the detach
		this.canvas.style.display = 'inherit';	// Reattach to DOM
	};

}