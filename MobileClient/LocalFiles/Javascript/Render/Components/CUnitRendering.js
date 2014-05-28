"use strict";

var CUnitRendering = function CUnitRendering() {
	
	this.sprite = null;
	this.$text = $('<span class="unit_health" />');
};

ComponentsUtils.registerNonPersistent(CUnitRendering);



//
// Short-cuts
//

CUnitRendering.prototype.hide = function () {
	$(this.sprite.dom).hide();
};

CUnitRendering.prototype.show = function () {
	$(this.sprite.dom).show();
};

CUnitRendering.prototype.move = function (x, y) {
	this.sprite.position(x, y);
	this.sprite.update();
}

CUnitRendering.prototype.detach = function () {
	this.$text.detach();
	this.sprite.remove();
};
