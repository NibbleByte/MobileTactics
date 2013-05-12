"use strict";

var CStatistics = function (go_this) {
	var self = this;
	
	// Setter (once)/getter
	this.UMessage('baseStatistics', function (baseStatistics) {
		if (baseStatistics == undefined) {
			console.assert(m_baseStatistics !== null, 'BaseStatistics not set yet!');
			return m_baseStatistics;
		} else {
			console.assert(m_baseStatistics === null, 'BaseStatistics can\'t be set more than once!');
			m_baseStatistics = baseStatistics;
		}
		
	});
	
	// getter
	this.UMessage('getStatistics', function (statistics) {
		console.assert(m_baseStatistics !== null, 'BaseStatistics not set yet!');
		
		return m_baseStatistics;
	});
	
	//
	// Private
	//
	var m_baseStatistics = null;	
};

EntityManager.registerComponent('CStatistics', CStatistics);