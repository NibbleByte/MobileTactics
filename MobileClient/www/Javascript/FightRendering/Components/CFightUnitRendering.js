"use strict";

var CFightUnitRendering = function CFightUnitRendering() {
	this.skin = '';
	this.sprite = null;
};

ComponentsUtils.registerNonPersistent(CFightUnitRendering);


CFightUnitRendering.prototype.destroy = function () {
	this.sprite.remove();
}

//
// Short-cuts
//

CFightUnitRendering.prototype.move = function (x, y) {
	this.sprite.position(x, y);
	this.sprite.update();
}
