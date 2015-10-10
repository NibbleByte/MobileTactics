"use strict";

var CFightUnitRendering = function CFightUnitRendering() {
	this.skin = '';
	this.sprite = null;
	this.tileSprite = null;
	this.dylingSprite = null;

	this.ownerPortrait = null; // HACK: Cause it is simpler to attach portrait to the single unit.
};

ComponentsUtils.registerNonPersistent(CFightUnitRendering);


CFightUnitRendering.prototype.destroy = function () {
	if (this.sprite) this.sprite.remove();
	if (this.tileSprite) this.tileSprite.remove();
	if (this.dylingSprite) this.dylingSprite.remove();
	if (this.ownerPortrait) this.ownerPortrait.remove();
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

	if (this.dylingSprite) {
		this.dylingSprite.position(x, y);
		this.dylingSprite.update();
	}
}
