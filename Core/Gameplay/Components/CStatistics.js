"use strict";

var CStatistics = function () {
	this.baseStatistics = null;
	this.statistics = null;
};

ComponentsUtils.registerPersistent('CStatistics', CStatistics);

//
//Short-cuts
//	
CStatistics.prototype.resetStatistics = function (baseStatistics) {
	if (baseStatistics)
		this.baseStatistics = baseStatistics;
	
	this.statistics = {};
	$.extend(this.statistics, this.baseStatistics);
};