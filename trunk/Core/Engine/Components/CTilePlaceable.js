"use strict";

var CTilePlaceable = function (go_this) {
	var self = this;
	
	// Setter/getter
	this.UMessage('tile', function (tile) {
		if (tile == undefined) {
			return m_tile;
		} else {			
			m_tile = tile;
		}
		
	});

	//
	// Private
	//
	var m_tile;
};

EntityManager.registerComponent('CTilePlaceable', CTilePlaceable);