"use strict";

var CStatistics = function () {
	this.baseStatistics = null;
	this.statistics = null;
};

ECS.EntityManager.registerComponent('CStatistics', CStatistics);

//
//Short-cuts
//	
CStatistics.prototype.resetStatistics = function (baseStatistics) {
	if (baseStatistics)
		this.baseStatistics = baseStatistics;
	
	this.statistics = {};
	$.extend(this.statistics, this.baseStatistics);
};