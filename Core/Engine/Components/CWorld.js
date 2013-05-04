"use strict";

var CWorld = function (go_this) {
	var self = this;
	
	// Setter/getter
	this.UMessage('world', function (world) {
		if (world == undefined) {
			console.assert(m_world, 'World not set yet!');
			return m_world;
		} else {
			m_world = world;
		}
		
	});
	
	
	
	//
	// Private
	//
	var m_world = null;
};

EntityManager.registerComponent('CWorld', CWorld);
EntityManager.addComponentDependencies(CTile, CWorld);
EntityManager.addComponentDependencies(CTilePlaceable, CWorld);