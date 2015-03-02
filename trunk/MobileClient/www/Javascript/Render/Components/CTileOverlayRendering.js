"use strict";

var CTileOverlayRendering = function CTileOverlayRendering() {
	this.sprite = null;
};

ComponentsUtils.registerNonPersistent(CTileOverlayRendering);


CTileOverlayRendering.prototype.destroy = function () {
	this.sprite.remove();
}

//
// Short-cuts
//

CTileOverlayRendering.prototype.hide = function () {
	this.sprite.skipDrawing = true; // Custom field!
};

CTileOverlayRendering.prototype.show = function () {
	this.sprite.skipDrawing = false; // Custom field!
};

CTileOverlayRendering.prototype.move = function (x, y) {
	this.sprite.position(x, y);
	this.sprite.update();
}
