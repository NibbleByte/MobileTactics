"use strict";

var CActionMove = function (go_this) {
	var self = this;
	
	// 
	// Objects
	// 
	this.MMessage('getAvailableActions', function (outActions) {
		var tile = go_this.tile();
		var adjacentTiles = go_this.world().getAdjacentTiles(tile);
		
		var availableTiles = [];
		for(var i = 0; i < adjacentTiles.length; ++i) {
			if (adjacentTiles[i].getPlacedObjects().length == 0)
				availableTiles.push(adjacentTiles[i]);
		}
		
		
		var action = new GameAction(self.getComponentId(), go_this);
		action.availableTiles = availableTiles;
		outActions.push(action);
	});
	
	this.executeAction = function (action) {
		// TODO: Modify statistics
		action.appliedTile.placeObject(go_this);
	}
	
	//
	// Private
	//
};

EntityManager.registerComponent('CActionMove', CActionMove);