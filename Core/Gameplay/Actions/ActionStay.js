"use strict";

var Actions = Actions || {};
Actions.Classes = Actions.Classes || {};

Actions.Classes.ActionStay = new function () {
	
	this.actionName = 'ActionStay';
	this.quickAction = true;

	this.getAvailableActions = function (eworld, world, player, placeable, outActions) {
		// Can stay only if just moved.
		if (placeable.CUnit.actionsData.getTurnData(placeable.CUnit.turnPoints).executedActions.last() == Actions.Classes.ActionMove) {
			var action = new GameAction(Actions.Classes.ActionStay, player, placeable);
			action.availableTiles = [ placeable.CTilePlaceable.tile ];
			outActions.push(action);
		}
	};
	
	this.executeAction = function (eworld, world, action) {

		var placeable = action.placeable;

		placeable.CUnit.turnPoints--;

		eworld.triggerAsync(GameplayEvents.Fog.FORCE_FOG_REFRESH);
	}

	this.undoAction = function (eworld, world, action) {
		var placeable = action.placeable;

		placeable.CUnit.turnPoints++;
	}
};
