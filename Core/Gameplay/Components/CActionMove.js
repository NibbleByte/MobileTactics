"use strict";

var CActionMove = function (go_this) {
	var self = this;
	
	// 
	// Objects
	// 
	this.MMessage('getAvailableActions', function (outActions) {
		var tile = go_this.tile();
		
		var availableTiles = [];
		gatherMovementTiles(tile, go_this.getStatistics()['Movement'], availableTiles);
		
		// Reset the tiles for another search
		for(var i = 0; i < availableTiles.length; ++i) {
			availableTiles[i].movementCostLeft(0);
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
	// TODO: Use iterative approach  
	var gatherMovementTiles = function (tile, movement, availableTiles) {

		availableTiles.push(tile);
		tile.movementCostLeft(movement);
		
		var adjacentTiles = go_this.world().getAdjacentTiles(tile);
		
		for(var i = 0; i < adjacentTiles.length; ++i) {
			var currentTile = adjacentTiles[i];
			
			// TODO: charge movement according to terrain cost.
			var movementLeft = movement - 1;
			
			if (currentTile.movementCostLeft() <= movementLeft && 
				currentTile.getPlacedObjects().length == 0 &&
				movementLeft >= 0) {
				
				gatherMovementTiles(currentTile, movementLeft, availableTiles);
			}
		}
		
	}
	
};

EntityManager.registerComponent('CActionMove', CActionMove);