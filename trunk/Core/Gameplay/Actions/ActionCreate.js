"use strict";

var Actions = Actions || {};
Actions.Classes = Actions.Classes || {};

// Action used to create placeables in the world, so it can have undo.
Actions.Classes.ActionCreate = new function () {
	
	this.actionName = 'ActionCreate';
	this.shouldRefreshVisibility = false;
	
	this.executeAction = function (eworld, world, action) {
		
		var placeable = action.placeable;

		eworld.addUnmanagedEntity(placeable);
		world.place(placeable, action.appliedTile);
	}

	this.undoAction = function (eworld, world, action) {
		eworld.removeManagedEntity(action.placeable);
	}
};
