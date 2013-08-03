"use strict";

var CUnitRendering = function () {
	
	this.$renderedHolder = $('<div class="placeable" />');
	this.$renderedHealth = $('<span class="unit_health" />')
	.appendTo(this.$renderedHolder)
	.text('??');
};

ECS.EntityManager.registerComponent('CUnitRendering', CUnitRendering);


//
// Short-cuts
//

CUnitRendering.prototype.renderAt = function (x, y) {
	this.$renderedHolder
	.css('top', y)
	.css('left', x);
};

CUnitRendering.prototype.setHealth = function(health) {
	this.$renderedHealth.text(health.toPrecision(2));
};
