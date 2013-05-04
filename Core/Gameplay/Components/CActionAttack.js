"use strict";

var CActionAttack = function (go_this) {
	var self = this;
	
	// 
	// Objects
	// 
	this.MMessage('getAvailableActions', function (outActions) {
		var tile = go_this.tile();
		var placeables = go_this.world().getPlaceablesInArea(tile, 2, go_this); // TODO: Get radius from statistics
		
		var availableTiles = [];
		for(var i = 0; i < placeables.length; ++i) {
			availableTiles.push(placeables[i].tile());
		}
		
		
		var action = new GameAction(self.getComponentId(), go_this);
		action.availableTiles = availableTiles;
		
		outActions.push(action);
	});
	
	this.executeAction = function (action) {
		// TODO: Modify statistics
		console.log("Attack at: " + action.appliedTile.row() + ", " + action.appliedTile.column());
	}
	
	//
	// Private
	//
};

EntityManager.registerComponent('CActionAttack', CActionAttack);