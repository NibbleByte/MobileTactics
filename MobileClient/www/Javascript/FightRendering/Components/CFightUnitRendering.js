"use strict";

var CFightUnitRendering = function CFightUnitRendering() {
	this.skin = '';
	this.sprite = null;
	this.tileSprite = null;
};

ComponentsUtils.registerNonPersistent(CFightUnitRendering);


CFightUnitRendering.prototype.destroy = function () {
	if (this.sprite) this.sprite.remove();
	if (this.tileSprite) this.tileSprite.remove();
}

//
// Short-cuts
//

CFightUnitRendering.prototype.move = function (x, y) {
	if (this.sprite) {
		this.sprite.position(x, y);
		this.sprite.update();
	}

	if (this.tileSprite) {
		this.tileSprite.position(x, y);
		this.tileSprite.update();
	}
}
