"use strict";

var CStatistics = function CStatistics() {
	this.baseStatistics = null;
	this.statistics = null;
	
	this.terrainStats = null;
};

ComponentsUtils.registerNonPersistent(CStatistics);

//
//Short-cuts
//	
CStatistics.prototype.resetStatistics = function () {
	this.statistics = {};
	$.extend(this.statistics, this.baseStatistics);
};