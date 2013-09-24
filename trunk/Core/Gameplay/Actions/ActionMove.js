"use strict";

var Actions = Actions || {};
Actions.Classes = Actions.Classes || {};

Actions.Classes.ActionMove = new function () {
	
	this.actionName = 'ActionMove';

	this.getAvailableActions = function (world, placeable, outActions) {
		var tile = placeable.CTilePlaceable.tile;
		
		var availableTiles = [];
		
		gatherMovementTiles(world, tile, placeable.CStatistics.statistics['Movement'], availableTiles);
		
		// If nowhere to move, action is unavailable.
		if (availableTiles.length <= 1) {
			return;
		}
		
		// Reset the tiles for another search
		for(var i = 0; i < availableTiles.length; ++i) {
			availableTiles[i].CTile.movementCostLeft = 0;
		}
		
		var action = new GameAction(Actions.Classes.ActionMove, placeable);
		action.availableTiles = availableTiles;
		outActions.push(action);
	};
	
	this.executeAction = function (world, action) {
		// TODO: Modify statistics
		world.place(action.placeable, action.appliedTile);
	}
	
	//
	// Private
	//
	// TODO: Use iterative approach
	var gatherMovementTiles = function (world, tile, movement, availableTiles) {

		availableTiles.push(tile);
		tile.CTile.movementCostLeft = movement;
		
		var adjacentTiles = world.getAdjacentTiles(tile);
		
		for(var i = 0; i < adjacentTiles.length; ++i) {
			var currentTile = adjacentTiles[i];
			
			// TODO: charge movement according to terrain cost.
			var movementLeft = movement - 1;
			
			if (currentTile.CTile.movementCostLeft <= movementLeft && 
				currentTile.CTile.placedObjects.length == 0 &&
				movementLeft >= 0) {
				
				gatherMovementTiles(world, currentTile, movementLeft, availableTiles);
			}
		}
		
	}
	
};
