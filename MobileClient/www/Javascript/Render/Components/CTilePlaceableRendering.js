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
	$(this.sprite.dom).hide();
};

CTilePlaceableRendering.prototype.show = function () {
	$(this.sprite.dom).show();
};

CTilePlaceableRendering.prototype.move = function (x, y) {
	this.sprite.position(x, y);
	this.sprite.update();
}
