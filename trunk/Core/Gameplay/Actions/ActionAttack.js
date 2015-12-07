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

		var playersData = eworld.extract(PlayersData);
		
		var placeables = world.getPlaceablesInArea(tile, attackRangeMin, attackRange, placeable);
		
		var availableTiles = [];
		for(var i = 0; i < placeables.length; ++i) {
			var target = placeables[i];

			if (this.canAttack(placeable, target, playersData))
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

	this.getPotentialAttackTiles = function (eworld, world, placeable, tiles) {
		var potentialTiles = [];

		var attackRangeMin = placeable.CStatistics.statistics['AttackRangeMin'] || 0;
		var attackRange = placeable.CStatistics.statistics['AttackRange'];

		var playersData = eworld.extract(PlayersData);

		var placeablesInRange = [];
		for(var i = 0; i < tiles.length; ++i) {
			var tile = tiles[i];

			var placeables = world.getPlaceablesInArea(tile, attackRangeMin, attackRange, placeable);
			
			for(var j = 0; j < placeables.length; ++j) {
				if (!placeablesInRange.contains(placeables[j])) {
					placeablesInRange.push(placeables[j]);
				}
			}
		}


		for (var i = 0; i < placeablesInRange.length; ++i) {
			var target = placeablesInRange[i];

			if (this.canAttack(placeable, target, playersData))
				potentialTiles.push(target.CTilePlaceable.tile);
		}

		return potentialTiles;
	};

	this.canAttack = function (attacker, defender, playersData) {
		return playersData.getRelation(attacker.CPlayerData.player, defender.CPlayerData.player) == PlayersData.Relation.Enemy &&
				defender.CTilePlaceable.tile.CTileVisibility.visible &&
				UnitsUtils.canAttackType(attacker, defender);
	}
	
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
