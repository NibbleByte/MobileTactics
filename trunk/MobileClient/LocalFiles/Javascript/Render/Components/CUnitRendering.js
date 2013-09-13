"use strict";

var CUnitRendering = function () {
	
	this.sprite = null;
	this.$text = $('<span class="unit_health" />');
};

ComponentsUtils.registerNonPersistent('CUnitRendering', CUnitRendering);
