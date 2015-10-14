"use strict";

var Actions = Actions || {};
Actions.Classes = Actions.Classes || {};

Actions.Classes.ActionMove = new function () {
	
	this.actionName = 'ActionMove';
	this.quickAction = false;

	this.getAvailableActions = function (eworld, world, player, placeable, outActions) {

		if (placeable.CUnit.actionsData.getTurnData(placeable.CUnit.turnPoints).executedActions.last() == Actions.Classes.ActionMove)
			return;

		var tile = placeable.CTilePlaceable.tile;

		var movementData = {
			placeable: placeable,
			player: player,
			playersData: eworld.extract(PlayersData),
			world: world,
		}
		
		// Choose normal or after-attack movement.
		var movement = (!Actions.Classes.ActionAttack.hasExecutedAction(placeable)) 
						? placeable.CStatistics.statistics['Movement'] 
						: placeable.CStatistics.statistics['MovementAttack'];
		var availableTiles = world.gatherTiles(tile, movement, this.movementCostQuery, movementData);

		if (Actions.Classes.ActionAttack.hasExecutedAction(placeable))
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

	this.hasExecutedAction = function (placeable) {
		return placeable && placeable.CUnit.actionsData.hasExecutedAction(placeable.CUnit.turnPoints, this);
	}

	this.movementCostQuery = function (tile, userData, queryResult, prevTile) {
		var terrainStats = userData.placeable.CStatistics.terrainStats[tile.CTileTerrain.type];

		// Check if has any placeable and its relation towards it.
		var placedObject = tile.CTile.placedObjects[0];
		var relation = PlayersData.Relation.Neutral;
		if (placedObject) {
			relation = userData.playersData.getRelation(userData.player, placedObject.CPlayerData.player);
		}

		var visible = tile.CTileVisibility.visible;

		queryResult.cost = (terrainStats) ? terrainStats.Cost : undefined;

		// Can't pass over enemies... unless it can't see them (for enemy preview ONLY).
		queryResult.passOver = relation != PlayersData.Relation.Enemy || !visible;

		if (queryResult.passOver && !userData.world.isStartGatheredTile(prevTile)) {
			queryResult.passOver = checkZoneOfControl(tile, userData) || checkZoneOfControl(prevTile, userData);
		}

		// Same...
		queryResult.discard = tile.CTile.placedObjects.length != 0 && visible;
	}


	var checkZoneOfControl = function (tile, userData) {
		var adjacentTiles = userData.world.getAdjacentTiles(tile);
		for(var i = 0; i < adjacentTiles.length; ++i) {
			var adjacentTile = adjacentTiles[i];
			if (adjacentTile.CTile.placedObjects.length > 0) {
				var adjacentPlaceable = adjacentTile.CTile.placedObjects[0];
					
				var relation = userData.playersData.getRelation(userData.player, adjacentPlaceable.CPlayerData.player);
				if (relation == PlayersData.Relation.Enemy) {
					return false;
				}	
			}
		}

		return true;
	}
};
