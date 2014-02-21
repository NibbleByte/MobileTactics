"use strict";

var Actions = Actions || {};
Actions.Classes = Actions.Classes || {};

Actions.Classes.ActionMove = new function () {
	
	this.actionName = 'ActionMove';

	this.getAvailableActions = function (eworld, world, player, placeable, outActions) {
		var tile = placeable.CTilePlaceable.tile;
		
		var movementData = {
			placeable: placeable,
			player: player,
			playersData: eworld.extract(PlayersData),
		}
		

		var availableTiles = world.gatherTiles(tile, placeable.CStatistics.statistics['Movement'], movementCostQuery, movementData);
		
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
	var movementCostQuery = function (tile, userData) {
		var terrainCost = userData.placeable.CStatistics.terrainCost[tile.CTileTerrain.type];

		// Check if has any placeable and its relation towards it.
		var placedObject = tile.CTile.placedObjects[0];
		var relation = PlayersData.Relation.Neutral;
		if (placedObject) {
			relation = userData.playersData.getRelation(userData.player, placedObject.CPlayerData.player);
		}

		return {
			cost: terrainCost,
			passOver: relation != PlayersData.Relation.Enemy, // Can't pass over enemies
			discard: tile.CTile.placedObjects.length != 0,
		};
	}

};
