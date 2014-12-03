"use strict";

var CBattleUnitRendering = function CBattleUnitRendering() {
	this.skin = '';
	this.sprite = null;
};

ComponentsUtils.registerNonPersistent(CBattleUnitRendering);


CBattleUnitRendering.prototype.destroy = function () {
	this.sprite.remove();
}

//
// Short-cuts
//

CBattleUnitRendering.prototype.hide = function () {
	this.sprite.skipDrawing = true; 	// Custom field!
};

CBattleUnitRendering.prototype.show = function () {
	this.sprite.skipDrawing = false; // Custom field!
};

CBattleUnitRendering.prototype.move = function (x, y) {
	this.sprite.position(x, y);
	this.sprite.update();
}
