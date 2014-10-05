//===============================================
// GameWorldRenderer
// Holds the main elements needed for rendering anyhing.
//===============================================
"use strict";

var GameWorldRenderer = function (holderElement, eworld) {
	var self = this;
	
	console.assert(holderElement instanceof HTMLElement, "HTMLElement is required.");
		
	this.pnHolder = holderElement;
	this.extentWidth = 0;
	this.extentHeight = 0;
	
	this.$pnWorldPlot = $('<div id="WorldPlot"></div>').appendTo(this.pnHolder);
	
	this.scene = sjs.Scene({
		parent: this.$pnWorldPlot[0],
		autoPause: false,
	});
	
	this.layers = [];
	
	for(var layerName in WorldLayers.LayerTypes) {
		this.layers[WorldLayers.LayerTypes[layerName]] = 
			this.scene.Layer(layerName, WorldLayers.layersOptions[layerName]);
	}
	

	this.spriteTracker = new SpriteTracker(this.scene);
	this.spriteTracker.spriteCreatedCallback = function (sprite) {
		eworld.trigger(RenderEvents.Sprites.SPRITE_CREATED, sprite);
	}
	this.spriteTracker.spritesRemovedCallback = function (sprites) {
		eworld.trigger(RenderEvents.Sprites.SPRITES_REMOVED, [sprites]);
	}
	
	var plotContainerScroller = null;
	
	this.refresh = function () {
		
		// HACK: Resize manually the scene and layers
		$(self.scene.dom).width(self.extentWidth);
		$(self.scene.dom).height(self.extentHeight);

		for(var i = 0; i < self.layers.length; ++i) {
			var layer = self.layers[i]

			console.assert(layer.useCanvas != undefined, 'Sprite.js API changed.');

			if (layer.useCanvas) {
				$(layer.dom).attr('width', self.extentWidth);
				$(layer.dom).attr('height', self.extentHeight);
			} else {
				$(layer.dom).width(self.extentWidth);
				$(layer.dom).height(self.extentHeight);
			}
		}
		
		// TODO: Unneeded check, due to timeouts on initialize
		if (plotContainerScroller)
			plotContainerScroller.refresh();
		
	}

	

	// Enhancement of Sprite.js functionality - Sprite.loadImg. It adds parameters to the UN-DOCUMENTED "onload" callback.
	this.createSprite = function (layer, resourcePath, onLoadedCallback, userParam1, userParam2, userParam3, userParam4) {
		var sprite = self.layers[layer].Sprite();
		
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




	this.getRenderedTilePosition = function (row, column) {
		
		// http://www.redblobgames.com/grids/hexagons/#hex-to-pixel
		// basisX * column + basisY * row 
		var pos = GTile.TILE_BASIS_X.x(column).add( GTile.TILE_BASIS_Y.x(row) );
		
		return {
			x: pos.e(1) + GTile.LAYERS_PADDING,
			y: pos.e(2) + GTile.LAYERS_PADDING,
		};
	}
	
	this.getRenderedTileCenter = function (row, column) {
		var coords = self.getRenderedTilePosition(row, column);
		
		coords.x += GTile.TILE_WIDTH / 2;
		coords.y += GTile.TILE_HEIGHT / 2;
		
		return coords;
	}
	
	this.getTileCoordsAtPoint = function (x, y) {
		
		// Find Offset coordinates (based on rectangle approximation)
		var rectRow = Math.floor(y / GTile.TILE_VOFFSET);
		var rectColumn = Math.floor( (x - (rectRow % 2) * GTile.TILE_HOFFSET) / GTile.TILE_WIDTH );
		
		// Used conversion: http://www.redblobgames.com/grids/hexagons/#conversions
		// Modified to use it with the current coordinate system.
		var cubeY = rectColumn + (rectRow + (rectRow & 1)) / 2;
		var cubeZ = rectRow;
		
		
		// x,y offset relative to rectangle tile.
		var localX = x - rectColumn * GTile.TILE_WIDTH - (rectRow % 2) * GTile.TILE_HOFFSET;
		var localY = y - rectRow * GTile.TILE_VOFFSET;
		
		// Find if clicked over this hex, or the adjacent top left/right one.
		
		// Use a line equation imitating the /\ form of the top of the hex.
		// Similar to: http://www.gdreflections.com/2011/02/hexagonal-grid-math.html
		var isInside = localY > -GTile.TILE_SIDE_SLOPE * Math.abs(GTile.TILE_WIDTH / 2 - localX);		
		if (!isInside) {
			--cubeZ;
			
			if (localX < GTile.TILE_WIDTH / 2) {
				--cubeY;
			}
		}
		
		
		return {
			row: cubeZ,
			column: cubeY
		}
	}

	this.destroy = function () {
		plotContainerScroller.destroy();
		plotContainerScroller = null;

		self.scene.reset();
		self.layers = [];
		self.spriteTracker.destroy();
		self.spriteTracker = null;
		self.scene = null;

		self.$pnWorldPlot.remove();
	}
	
	//
	// Initialize
	//
	
	// TODO: Fix this issue with height = 0 on startup
	setTimeout(function () {
		plotContainerScroller = new iScroll(self.$pnWorldPlot[0], {
			lockDirection: false,
			hideScrollbar: true,
			bounce: false,
		});
	}, 1);
}


//
// Allow API for easy using multiple onload handlers.
//
sjs.Sprite.prototype.addOnLoadHandler = function (handler) {
	this.__onloadHandlers = this.__onloadHandlers || [];

	this.__onloadHandlers.push(handler);

	// Sanity-check
	if (this.__onloadHandlers.length > 5) {
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