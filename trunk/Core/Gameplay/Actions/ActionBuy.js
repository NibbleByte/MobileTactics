"use strict";

var Actions = Actions || {};
Actions.Classes = Actions.Classes || {};

// Action used to buy placeables, so it can have undo.
Actions.Classes.ActionBuy = new function () {
	
	this.actionName = 'ActionBuy';
	
	this.executeAction = function (eworld, world, action) {
		
		var placeable = action.placeable;

		// TODO: Take players money. Take storeItem from action.undoData. Don't forget to undo it too.

		placeable.CUnit.turnPoints = 0;
		placeable.CUnit.finishedTurn = true;

		eworld.addUnmanagedEntity(placeable);
		world.place(placeable, action.appliedTile);
	}

	this.undoAction = function (eworld, world, action) {
		eworld.removeManagedEntity(action.placeable);
	}
};
