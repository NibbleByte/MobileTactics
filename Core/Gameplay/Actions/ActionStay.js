"use strict";

var Actions = Actions || {};
Actions.Classes = Actions.Classes || {};

Actions.Classes.ActionStay = new function () {
	
	this.actionName = 'ActionStay';
	this.quickAction = true;

	this.getAvailableActions = function (eworld, world, player, placeable, outActions) {
		// Can stay only if previewing movement.
		if (placeable.CUnit.actionsData.previewOriginalTile) {
			var action = new GameAction(Actions.Classes.ActionStay, player, placeable);
			action.availableTiles = [ placeable.CTilePlaceable.tile ];
			outActions.push(action);
		}
	};
	
	this.executeAction = function (eworld, world, action) {
		action.placeable.CUnit.finishedTurn = true;
	}
};
