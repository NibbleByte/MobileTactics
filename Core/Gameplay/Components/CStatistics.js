"use strict";

var CStatistics = function CStatistics() {
	this.baseStatistics = null;
	this.statistics = null;
	
	this.terrainStats = null;
};

ComponentsUtils.registerPersistent(CStatistics);

//
//Short-cuts
//	
CStatistics.prototype.resetStatistics = function (baseStatistics) {
	if (baseStatistics)
		this.baseStatistics = baseStatistics;
	
	this.statistics = {};
	$.extend(this.statistics, this.baseStatistics);
};