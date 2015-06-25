"use strict";

var CBattleUnitRendering = function CBattleUnitRendering() {
	this.skin = '';
	this.sprite = null;

	// Additional sprites
	this.spriteExplosion = null;
};

ComponentsUtils.registerNonPersistent(CBattleUnitRendering);


CBattleUnitRendering.prototype.destroy = function () {
	this.sprite.remove();

	if (this.spriteExplosion) {
		this.spriteExplosion.remove();
	}
}

//
// Short-cuts
//

CBattleUnitRendering.prototype.hide = function () {
	this.sprite.hide();
};

CBattleUnitRendering.prototype.show = function () {
	this.sprite.show();
};

CBattleUnitRendering.prototype.move = function (x, y) {
	this.sprite.position(x, y);
	this.sprite.update();
}
