"use strict";

var Actions = Actions || {};
Actions.Classes = Actions.Classes || {};

Actions.Classes.ActionMove = new function () {
	
	this.actionName = 'ActionMove';

	this.getAvailableActions = function (eworld, world, player, placeable, outActions) {
		var tile = placeable.CTilePlaceable.tile;
		
		var availableTiles = [];
		var playersData = eworld.blackboard[PlayersData.BLACKBOARD_NAME];
		
		gatherMovementTiles(world, tile, placeable.CStatistics.statistics['Movement'], player, playersData, availableTiles);
		
		// If nowhere to move, action is unavailable.
		if (availableTiles.length <= 1) {
			return;
		}
		
		// Reset the tiles for another search
		for(var i = 0; i < availableTiles.length; ++i) {
			availableTiles[i].CTileTerrain.movementCostLeft = 0;
		}
		
		var action = new GameAction(Actions.Classes.ActionMove, player, placeable);
		action.availableTiles = availableTiles;
		outActions.push(action);
	};
	
	this.executeAction = function (eworld, world, action) {
		// TODO: Modify statistics
		world.place(action.placeable, action.appliedTile);
	}
	
	//
	// Private
	//
	// TODO: Use iterative approach
	var gatherMovementTiles = function (world, tile, movement, player, playersData, availableTiles) {
		
		// Currently, only one unit per tile is allowed.
		// This tile is still added, in case an ally unit has occupied it.
		if (tile.CTile.placedObjects.length == 0) {
			availableTiles.push(tile);
			tile.CTileTerrain.movementCostLeft = movement;
		}
		
		var adjacentTiles = world.getAdjacentTiles(tile);
		
		for(var i = 0; i < adjacentTiles.length; ++i) {
			var currentTile = adjacentTiles[i];
			
			// TODO: charge movement according to terrain cost.
			var movementLeft = movement - 1;
			
			var placedObject = currentTile.CTile.placedObjects[0];
			
			if (currentTile.CTileTerrain.movementCostLeft <= movementLeft && 
				(!placedObject || playersData.getRelation(player.id, placedObject.CPlayerData.playerId)) &&	// Can pass over allies
				movementLeft >= 0) {
				
				gatherMovementTiles(world, currentTile, movementLeft, player, playersData, availableTiles);
			}
		}
		
	}
	
};
