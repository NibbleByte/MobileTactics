"use strict";

var CTilePlaceableRendering = function CTilePlaceableRendering() {
	this.skin = '';
	this.sprite = null;
};

ComponentsUtils.registerNonPersistent(CTilePlaceableRendering);


CTilePlaceableRendering.prototype.destroy = function () {
	this.sprite.remove();
}

//
// Short-cuts
//

CTilePlaceableRendering.prototype.hide = function () {
	this.sprite.skipDrawing = true;		// Custom field!
};

CTilePlaceableRendering.prototype.show = function () {
	this.sprite.skipDrawing = false;	// Custom field!
};

CTilePlaceableRendering.prototype.move = function (x, y) {
	this.sprite.position(x, y);
	this.sprite.update();
}
