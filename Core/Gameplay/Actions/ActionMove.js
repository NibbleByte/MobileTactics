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
			playersData: eworld.extract(PlayersData),
		}
		
		gatherMovementTiles(movementData, tile, placeable.CStatistics.statistics['Movement'], availableTiles);
		
		// If nowhere to move, action is unavailable.
		if (availableTiles.length <= 1) {
			return;
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
	var gatherMovementTiles = function (movementData, startTile, movement, availableTiles) {
		var open = [ startTile ];
		var visited = [];
		
		startTile.__$movementLeft = movement;
		startTile.__$cameFrom = null;
		
		
		while(open.length != 0) {
			var openTile = open.shift();
			var openMovementLeft = openTile.__$movementLeft;
			
			var adjacentTiles = movementData.world.getAdjacentTiles(openTile);
			
			for(var i = 0; i < adjacentTiles.length; ++i) {
				var tile = adjacentTiles[i];
				
				if (tile == openTile.__$cameFrom) {
					continue;
				}
				
				var terrainCost = movementData.placeable.CStatistics.terrainCost[tile.CTileTerrain.type];
				if (terrainCost == undefined)
					continue;
				
				var movementLeft = openMovementLeft - terrainCost;
				var oldMovementLeft = tile.__$movementLeft || 0;
				
				// Check if has any placeable and its relation towards it.
				var placedObject = tile.CTile.placedObjects[0];
				var relation = PlayersData.Relation.Neutral;
				if (placedObject) {
					relation = movementData.playersData.getRelation(movementData.player, placedObject.CPlayerData.player);
				}
				
				
				if (oldMovementLeft <= movementLeft
					&& relation != PlayersData.Relation.Enemy // Can't pass over enemies
					&& movementLeft >= 0
					) {
					tile.__$movementLeft = movementLeft;
					tile.__$cameFrom = openTile;
					
					if (open.indexOf(tile) == -1) {
						open.push(tile);
					}
				}
				
			}
			
			
			if (visited.indexOf(openTile) == -1) {
				
				// When searching for closed tiles, recent ones should be in front because they are more likely to be needed.
				visited.unshift(openTile);
				
				// Can't stack units.
				if (openTile != startTile && openTile.CTile.placedObjects.length == 0) {
					availableTiles.push(openTile);
				}
			}
		}
		
		
		// Cleanup algorithm data.
		for(var i = 0; i < visited.length; ++i) {
			delete visited[i].__$movementLeft;
			delete visited[i].__$cameFrom;
		}
	}
	
};
