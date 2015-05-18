"use strict";

var CUnitRendering = function CUnitRendering() {
	
	this.sprite = null;
	this.$text = $('<span class="unit_health statistics_text" />');

	this.spriteFinished = null;
};

ComponentsUtils.registerNonPersistent(CUnitRendering);


CUnitRendering.prototype.destroy = function () {
	this.$text.detach();
	this.sprite.remove();
	this.spriteFinished.remove();
}


//
// Short-cuts
//

CUnitRendering.prototype.hide = function () {
	$(this.sprite.dom).hide();
};

CUnitRendering.prototype.show = function () {
	$(this.sprite.dom).show();
};

CUnitRendering.prototype.hideFinished = function () {
	$(this.spriteFinished.dom).hide();
};

CUnitRendering.prototype.showFinished = function (finished) {
	if (finished || finished === undefined) {
		$(this.spriteFinished.dom).show();
	} else {
		this.hideFinished();
	}
};

CUnitRendering.prototype.move = function (x, y, renderer) {
	this.sprite.position(renderer.zoomBack(x), renderer.zoomBack(y));
	this.sprite.update();

	// Cause unit sprites are centered.
	this.spriteFinished.position(x - this.spriteFinished.w / 2, y - this.spriteFinished.h / 2);
	this.spriteFinished.update();
}

