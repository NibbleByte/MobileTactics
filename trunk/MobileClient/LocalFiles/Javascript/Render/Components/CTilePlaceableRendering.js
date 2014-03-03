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
	$(this.sprite.dom).hide();
};

CTilePlaceableRendering.prototype.show = function () {
	$(this.sprite.dom).show();
};