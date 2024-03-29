"use strict";

var CUnitRendering = function CUnitRendering() {
	
	this.sprite = null;
	this.$health = $('<span class="unit_health statistics_text" />');
	this.$damage = $('<span class="unit_health_damage statistics_text" />');
	this.$loss = $('<span class="unit_health_loss statistics_text" />');

	this.spriteFinished = null;
};

ComponentsUtils.registerNonPersistent(CUnitRendering);


CUnitRendering.prototype.destroy = function () {
	this.$health.detach();
	this.$damage.detach();
	this.$loss.detach();
	this.sprite.remove();
	this.spriteFinished.remove();
}


//
// Short-cuts
//

CUnitRendering.prototype.hide = function () {
	this.sprite.hide();
};

CUnitRendering.prototype.show = function () {
	this.sprite.show();
};

CUnitRendering.prototype.hideFinished = function () {
	this.spriteFinished.hide();
};

CUnitRendering.prototype.showFinished = function (finished) {
	if (finished || finished === undefined) {
		this.spriteFinished.show();
	} else {
		this.spriteFinished.hide();
	}
};

CUnitRendering.prototype.move = function (x, y, renderer) {
	this.sprite.position(renderer.zoomBack(x), renderer.zoomBack(y));
	this.sprite.update();

	// Cause unit sprites are centered.
	this.spriteFinished.position(x - this.spriteFinished.w / 2, y - this.spriteFinished.h / 2);
	this.spriteFinished.update();
}

