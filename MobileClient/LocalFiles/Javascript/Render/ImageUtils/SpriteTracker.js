//===============================================
// SpriteTracker
// Hooks to Sprite.js API and keeps track of all the created sprites.
//===============================================
"use strict";

var SpriteTracker = function (m_scene) {
	var self = this;

	// Contains [layerName, sprite collection]
	this.layerSprites = {}

	this.spriteCreatedCallback = null;
	this.spritesRemovedCallback = null;

	var sceneOriginal = Utils.simpleCopyMembers(sjs.Scene.prototype);
	var layerOriginal = Utils.simpleCopyMembers(m_scene.layers['default']); // Steal members, no Class access :(
	var spriteOriginal = Utils.simpleCopyMembers(sjs.Sprite.prototype);



	// Use these to add/remove sprites to the scene in order to keep track of the sprites.
	this.createSprite = function (layer, src, options) {
		// Create using the original method.
		var sprite = layerOriginal.Sprite.call(layer, src, options);

		if (self.layerSprites[layer.name] == undefined) {
			self.layerSprites[layer.name] = [];
		}

		self.layerSprites[layer.name].push(sprite);
		
		if (self.spriteCreatedCallback)
			self.spriteCreatedCallback(sprite);

		return sprite;
	}

	this.removeSprite = function (sprite) {
		var sprites = self.layerSprites[sprite.layer.name];

		sprites.remove(sprite);

		if (self.spritesRemovedCallback)
			self.spritesRemovedCallback( [sprite] );

		spriteOriginal.remove.call(sprite);

		Utils.invalidate(sprite);
	}


	//
	// Override API to force sprite tracking.
	//

	// Scene
	sjs.Scene.prototype.Sprite = function (src, layer) {
		return self.createSprite(layer, src);
	}

	sjs.Scene.prototype.reset = function () {
		var sprites = [];
		for(var layerName in self.layerSprites) {
			sprites = sprites.concat(self.layerSprites[layerName]);
		}

		if (self.spritesRemovedCallback) {
			self.spritesRemovedCallback(sprites);
		}
		
		sceneOriginal.reset.apply(this);

		self.layerSprites = {};

		for(var i = 0; i < sprites.length; ++i) {
			Utils.invalidate(sprites[i]);
		}
	}

	// If creating new layers after we have started...
	sjs.Scene.prototype.Layer = function () {
		var layer = sceneOriginal.Layer.apply(this, arguments);

		layer.Sprite = layerCustomSprite;
		layer.remove = layerCustomRemove;

		return layer;
	}



	// Layer. It's a bit different, as we have no access to the prototype. Go figure...
	var layerCustomSprite = function (src, options) {
		return self.createSprite(this, src, options);
	}
	var layerCustomRemove = function () {
		var sprites = self.layerSprites[this.name];

		if (self.spritesRemovedCallback && sprites) {
			self.spritesRemovedCallback(sprites);
		}

		delete self.layerSprites[this.name];

		layerOriginal.remove.apply(this);

		for (var i = 0; i < sprites.length; ++i) {
			Utils.invalidate(sprites[i]);
		}
	}

	for (var layerName in m_scene.layers) {
		m_scene.layers[layerName].Sprite = layerCustomSprite;
		m_scene.layers[layerName].remove = layerCustomRemove;
	}


	// Sprite
	sjs.Sprite.prototype.remove = function () {
		self.removeSprite(this);
	}
}
