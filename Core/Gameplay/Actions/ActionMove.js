"use strict";

var Actions = Actions || {};
Actions.Classes = Actions.Classes || {};

Actions.Classes.ActionMove = new function () {
	
	this.actionName = 'ActionMove';

	this.getAvailableActions = function (eworld, world, player, placeable, outActions) {
		var tile = placeable.CTilePlaceable.tile;
		
		var availableTiles = [];
		
		var movementData = {
			world: world,
			placeable: placeable,
			player: player,
			playersData: eworld.blackboard[PlayersData.BLACKBOARD_NAME],
		}
		
		gatherMovementTiles(movementData, tile, placeable.CStatistics.statistics['Movement'], availableTiles);
		
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
	var gatherMovementTiles = function (movementData, tile, movement, availableTiles) {
		
		// Currently, only one unit per tile is allowed.
		// This tile is still added, in case an ally unit has occupied it.
		if (tile.CTile.placedObjects.length == 0) {
			availableTiles.push(tile);
			tile.CTileTerrain.movementCostLeft = movement;
		}
		
		var adjacentTiles = world.getAdjacentTiles(tile);
		
		for(var i = 0; i < adjacentTiles.length; ++i) {
			var currentTile = adjacentTiles[i];
			
			var terrainCost = movementData.placeable.CStatistics.terrainCost[currentTile.CTileTerrain.type];
			if (terrainCost == undefined)
				continue;
			
			var movementLeft = movement - terrainCost;
			
			var placedObject = currentTile.CTile.placedObjects[0];
			
			if (currentTile.CTileTerrain.movementCostLeft <= movementLeft && 
				(!placedObject || 
						movementData.playersData.getRelation(movementData.player.id, placedObject.CPlayerData.playerId)) &&	// Can pass over allies
				movementLeft >= 0) {
				
				gatherMovementTiles(movementData, currentTile, movementLeft, availableTiles);
			}
		}
		
	}
	
};
