"use strict";

var Actions = Actions || {};
Actions.Classes = Actions.Classes || {};

Actions.Classes.ActionMove = new function () {
	
	this.actionName = 'ActionMove';
	this.quickAction = false;
	this.shouldRefreshVisibility = true;	// Because while moving placeable, visibility will be applied without preview.

	this.getAvailableActions = function (eworld, world, player, placeable, outActions) {

		if (placeable.CUnit.actionsData.getTurnData(placeable.CUnit.turnPoints).executedActions.last() == Actions.Classes.ActionMove)
			return;

		var tile = placeable.CTilePlaceable.tile;

		var movementData = {
			placeable: placeable,
			player: player,
			playersData: eworld.extract(PlayersData),
		}
		
		// Choose normal or after-attack movement.
		var movement = (!placeable.CUnit.actionsData.hasExecutedAction(placeable.CUnit.turnPoints, Actions.Classes.ActionAttack)) 
						? placeable.CStatistics.statistics['Movement'] 
						: placeable.CStatistics.statistics['MovementAttack'];
		var availableTiles = world.gatherTiles(tile, movement, movementCostQuery, movementData);

		if (placeable.CUnit.actionsData.hasExecutedAction(placeable.CUnit.turnPoints, Actions.Classes.ActionAttack))
			availableTiles.push(tile);
		
		// If nowhere to move, action is unavailable.
		if (availableTiles.length == 0) {
			return;
		}
		
		var action = new GameAction(Actions.Classes.ActionMove, player, placeable);
		action.availableTiles = availableTiles;
		outActions.push(action);
	};
	
	this.executeAction = function (eworld, world, action) {
		var placeable = action.placeable;
		var startTile = placeable.CTilePlaceable.tile;

		action.undoData.previousTile = startTile;

		placeable.CUnit.actionsData.getTurnData(placeable.CUnit.turnPoints).previewOriginalTile.push(startTile);
		world.place(placeable, action.appliedTile);
	}
	
	this.undoAction = function (eworld, world, action) {
		var placeable = action.placeable;

		placeable.CUnit.actionsData.getTurnData(placeable.CUnit.turnPoints).previewOriginalTile.pop();
		world.place(placeable, action.undoData.previousTile);
	}

	//
	// Private
	//
	var movementCostQuery = function (tile, userData) {
		var terrainStats = userData.placeable.CStatistics.terrainStats[tile.CTileTerrain.type];
		var terrainCost = (terrainStats) ? terrainStats.Cost : undefined;

		// Check if has any placeable and its relation towards it.
		var placedObject = tile.CTile.placedObjects[0];
		var relation = PlayersData.Relation.Neutral;
		if (placedObject) {
			relation = userData.playersData.getRelation(userData.player, placedObject.CPlayerData.player);
		}

		var visible = tile.CTileVisibility.visible;

		// Can't pass over enemies... unless it can't see them (for enemy preview ONLY).
		var passOver = relation != PlayersData.Relation.Enemy || !visible;

		// Same...
		var discard = tile.CTile.placedObjects.length != 0 && visible;

		return {
			cost: terrainCost,
			passOver: passOver,
			discard: discard,
		};
	}

};
