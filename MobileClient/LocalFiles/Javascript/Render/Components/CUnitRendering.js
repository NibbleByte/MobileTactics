"use strict";

var CUnitRendering = function () {
	
	this.sprite = null;
	this.$text = $('<span class="unit_health" />');
};

ComponentsUtils.registerNonPersistent('CUnitRendering', CUnitRendering);



//
// Short-cuts
//

CUnitRendering.prototype.hide = function () {
	$(this.sprite.dom).hide();
};

CUnitRendering.prototype.show = function () {
	$(this.sprite.dom).show();
};