"use strict";

var Actions = Actions || {};
Actions.Classes = Actions.Classes || {};

Actions.Classes.ActionAttack = new function () {
	
	this.actionName = 'ActionAttack';
	this.quickAction = false;
	this.shouldRefreshVisibility = true;
	
	this.getAvailableActions = function (eworld, world, player, placeable, outActions) {

		if (this.hasExecutedAction(placeable, this))
			return;

		var tile = placeable.CTilePlaceable.tile;
		
		var placeables = world.getPlaceablesInArea(tile, placeable.CStatistics.statistics['AttackRange'], placeable);
		var playersData = eworld.extract(PlayersData);
		
		var availableTiles = [];
		for(var i = 0; i < placeables.length; ++i) {
			if (playersData.getRelation(placeables[i].CPlayerData.player, player) == PlayersData.Relation.Enemy	&&
				placeables[i].CTilePlaceable.tile.CTileVisibility.visible
			)
				availableTiles.push(placeables[i].CTilePlaceable.tile);
		}
		
		
		// If no targets, action is unavailable.
		if (availableTiles.length == 0) {
			return;
		}
		
		var action = new GameAction(Actions.Classes.ActionAttack, player, placeable);
		action.availableTiles = availableTiles;
		
		outActions.push(action);
	};
	
	this.executeAction = function (eworld, world, action) {

		var placeable = action.placeable;

		if (!placeable.CStatistics.statistics['MovementAttack']) {
			placeable.CUnit.turnPoints--;
		}

		var outcome = eworld.extract(BattleSystem).doAttack(action.placeable, action.appliedTile.CTile.placedObjects[0]);
		action.undoData.outcome = outcome;
	}

	this.undoAction = function (eworld, world, action) {
		var placeable = action.placeable;

		if (!placeable.CStatistics.statistics['MovementAttack']) {
			placeable.CUnit.turnPoints++;
		}

		eworld.extract(BattleSystem).revertOutcome(action.undoData.outcome);
	}

	this.hasExecutedAction = function (placeable) {
		return placeable && placeable.CUnit.actionsData.hasExecutedAction(placeable.CUnit.turnPoints, this);
	}
};
