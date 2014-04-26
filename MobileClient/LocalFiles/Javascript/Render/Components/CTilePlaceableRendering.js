"use strict";

var CTilePlaceableRendering = function () {
	this.skin = '';
	this.spriteVisible = true;
	this.sprite = null;
};

ComponentsUtils.registerNonPersistent('CTilePlaceableRendering', CTilePlaceableRendering);



//
// Short-cuts
//

CTilePlaceableRendering.prototype.hide = function () {
	this.spriteVisible = false;
};

CTilePlaceableRendering.prototype.show = function () {
	this.spriteVisible = true;
};