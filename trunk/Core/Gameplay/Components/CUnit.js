"use strict";

var CUnit = function (go_this) {
	var self = this;
	
	//
	// Public messages
	//
	this.UMessage('health', function (health) {
		if (health != undefined) {
			m_health = health;
		}
		
		return m_health;
	});
	
	this.UMessage('addHealth', function (health) {
		console.assert(health != undefined);
		
		return go_this.health(go_this.health() + health);
	});
	
	// 
	// Private
	//
	// TODO: Initialize health from elsewhere
	var m_health = 10;
};

EntityManager.registerComponent('CUnit', CUnit);
EntityManager.addComponentDependencies(CUnit, CEffects);