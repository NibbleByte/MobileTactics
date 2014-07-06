"use strict";

var Actions = Actions || {};
Actions.Classes = Actions.Classes || {};

Actions.Classes.ActionMove = new function () {
	
	this.actionName = 'ActionMove';
	this.quickAction = false;

	this.getAvailableActions = function (eworld, world, player, placeable, outActions) {

		if (placeable.CUnit.previewOriginalTile)
			return;

		var tile = placeable.CTilePlaceable.tile;

		var movementData = {
			placeable: placeable,
			player: player,
			playersData: eworld.extract(PlayersData),
		}
		
		var movement = (!placeable.CUnit.hasAttacked) ? placeable.CStatistics.statistics['Movement'] : placeable.CStatistics.statistics['MovementAttack'];
		var availableTiles = world.gatherTiles(tile, movement, movementCostQuery, movementData);

		if (placeable.CUnit.hasAttacked)
			availableTiles.push(tile);
		
		// If nowhere to move, action is unavailable.
		if (availableTiles.length <= 1) {
			return;
		}
		
		var action = new GameAction(Actions.Classes.ActionMove, player, placeable);
		action.availableTiles = availableTiles;
		outActions.push(action);
	};
	
	this.executeAction = function (eworld, world, action) {
		var startTile = action.placeable.CTilePlaceable.tile;

		action.undoData = {
			previousTile: startTile,
		};

		action.placeable.CUnit.previewOriginalTile = startTile;
		world.place(action.placeable, action.appliedTile);
	}
	
	this.undoAction = function (eworld, world, action) {
		action.placeable.CUnit.previewOriginalTile = null;
		world.place(action.placeable, action.undoData.previousTile);
	}

	this.onFinishedTurn = function (eworld, world, placeable) {
		if (placeable.CUnit.previewOriginalTile) {
			placeable.CUnit.previewOriginalTile = null;
			world.place(placeable, placeable.CTilePlaceable.tile);
		}
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
