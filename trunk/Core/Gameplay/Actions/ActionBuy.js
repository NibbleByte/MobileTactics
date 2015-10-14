"use strict";

var Actions = Actions || {};
Actions.Classes = Actions.Classes || {};

// Action used to buy placeables, so it can have undo.
Actions.Classes.ActionBuy = new function () {
	
	this.actionName = 'ActionBuy';
	
	this.executeAction = function (eworld, world, action) {
		
		var placeable = action.placeable;

		var storeItem = action.undoData;
		eworld.trigger(GameplayEvents.Resources.ADD_CREDITS, storeItem.player, -storeItem.price);

		eworld.addUnmanagedEntity(placeable);
		world.place(placeable, action.appliedTile);
	}

	this.undoAction = function (eworld, world, action) {
		eworld.removeManagedEntity(action.placeable);

		var storeItem = action.undoData;
		eworld.trigger(GameplayEvents.Resources.ADD_CREDITS, storeItem.player, storeItem.price);
	}
};
