"use strict";

var Actions = Actions || {};
Actions.Classes = Actions.Classes || {};

Actions.Classes.ActionAttack = new function () {
	
	this.actionName = 'ActionAttack';
	this.quickAction = false;
	
	this.getAvailableActions = function (eworld, world, player, placeable, outActions) {

		if (this.hasExecutedAction(placeable, this))
			return;

		if (!this.canExecuteAction(placeable))
			return;

		var tile = placeable.CTilePlaceable.tile;

		var attackRangeMin = placeable.CStatistics.statistics['AttackRangeMin'] || 0;
		var attackRange = placeable.CStatistics.statistics['AttackRange'];
		
		var placeables = world.getPlaceablesInArea(tile, attackRangeMin, attackRange, placeable);
		var playersData = eworld.extract(PlayersData);
		
		var availableTiles = [];
		for(var i = 0; i < placeables.length; ++i) {
			var target = placeables[i];

			if (playersData.getRelation(target.CPlayerData.player, player) == PlayersData.Relation.Enemy &&
				target.CTilePlaceable.tile.CTileVisibility.visible &&
				UnitsUtils.canAttackType(placeable, target)
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

		eworld.triggerAsync(GameplayEvents.Visibility.FORCE_VISIBILITY_REFRESH);

		eworld.trigger(GameplayEvents.Actions.ATTACK, outcome);
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

	this.canExecuteAction = function (placeable) {
		if (!placeable)
			return false;

		var hasMoved = placeable.CUnit.actionsData.hasExecutedAction(placeable.CUnit.turnPoints, Actions.Classes.ActionMove)
		return !hasMoved || (hasMoved && !placeable.CUnit.getDefinition().disableMoveAttack);
	}
};
