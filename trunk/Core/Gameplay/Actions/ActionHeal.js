"use strict";

var Actions = Actions || {};
Actions.Classes = Actions.Classes || {};

Actions.Classes.ActionHeal = new function () {
	
	this.actionName = 'ActionHeal';
	this.quickAction = true;
	
	this.getAvailableActions = function (eworld, world, player, placeable, outActions) {

		// Can heal only if no actions were executed at all.
		if (placeable.CUnit.actionsData.getTurnData(placeable.CUnit.turnPoints).executedActions.length != 0)
			return;

		if (placeable.CUnit.health >= placeable.CStatistics.statistics['MaxHealth'])
			return;
		
		var action = new GameAction(Actions.Classes.ActionHeal, player, placeable);
		action.availableTiles = [ placeable.CTilePlaceable.tile ];
		outActions.push(action);
	};
	
	this.executeAction = function (eworld, world, action) {
		var placeable = action.placeable;

		action.undoData.previousHealth = placeable.CUnit.health;

		placeable.CUnit.health += placeable.CStatistics.statistics['HealRate'] || 1;
		placeable.CUnit.health = Math.min(placeable.CStatistics.statistics['MaxHealth'], placeable.CUnit.health);


		placeable.CUnit.turnPoints--;

		eworld.trigger(GameplayEvents.Units.UNIT_CHANGED, placeable);
	};


	this.undoAction = function (eworld, world, action) {
		var placeable = action.placeable;

		placeable.CUnit.health = action.undoData.previousHealth;

		placeable.CUnit.turnPoints++;

		eworld.trigger(GameplayEvents.Units.UNIT_CHANGED, placeable);
	}
};
