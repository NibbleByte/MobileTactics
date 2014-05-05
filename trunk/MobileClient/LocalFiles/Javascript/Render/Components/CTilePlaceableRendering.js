"use strict";

var CTilePlaceableRendering = function () {
	this.skin = '';
	this.sprite = null;
};

ComponentsUtils.registerNonPersistent('CTilePlaceableRendering', CTilePlaceableRendering);



//
// Short-cuts
//

CTilePlaceableRendering.prototype.hide = function () {
	this.sprite.skipDrawing = true;		// Custom field!
};

CTilePlaceableRendering.prototype.show = function () {
	this.sprite.skipDrawing = false;	// Custom field!
};