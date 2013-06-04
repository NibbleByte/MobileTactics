"use strict";

var CUnitRendering = function (go_this) {
	var self = this;
	
	//
	// Public messages
	//
	this.UMessage('getPlaceableLayer', function () {
		return WorldLayers.LayerTypes.Units;
	});
	
};

EntityManager.registerComponent('CUnitRendering', CUnitRendering);
EntityManager.addComponentDependencies(CUnit, CUnitRendering);