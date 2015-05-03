"use strict";

var Actions = Actions || {};
Actions.Classes = Actions.Classes || {};

Actions.Classes.ActionCapture = new function () {
	
	this.actionName = 'ActionCapture';
	this.quickAction = true;
	
	this.getAvailableActions = function (eworld, world, player, placeable, outActions) {
		var tile = placeable.CTilePlaceable.tile;

		var playersData = eworld.extract(PlayersData);
		
		if (tile.CTileOwner) {
			var owner = tile.CTileOwner.owner;

			if (owner == null || playersData.getRelation(owner, player) != PlayersData.Relation.Ally) {

				var action = new GameAction(Actions.Classes.ActionCapture, player, placeable);
				action.availableTiles = [ placeable.CTilePlaceable.tile ];
				outActions.push(action);
			}
		}
	};
	
	this.executeAction = function (eworld, world, action) {
		
		var placeable = action.placeable;
		var appliedTile = action.placeable.CTilePlaceable.tile;

		action.undoData.previousTurnPoints = placeable.CUnit.turnPoints;

		appliedTile.CTileOwner.beingCapturedBy = placeable;
		appliedTile.CTileOwner.captureTurns = 1;
		
		// This action consumes the whole turn.
		placeable.CUnit.turnPoints = 0;

		// NOTE: this is executed BEFORE unit actually finishes turn (GameExecutor.executeAction finishes).
		eworld.trigger(GameplayEvents.Structures.CAPTURE_STARTED, appliedTile);

		eworld.triggerAsync(GameplayEvents.Fog.FORCE_FOG_REFRESH);
	}

	this.undoAction = function (eworld, world, action) {
		var placeable = action.placeable;
		var appliedTile = action.placeable.CTilePlaceable.tile;

		appliedTile.CTileOwner.beingCapturedBy = null;
		appliedTile.CTileOwner.captureTurns = 0;

		placeable.CUnit.turnPoints = action.undoData.previousTurnPoints;

		eworld.trigger(GameplayEvents.Structures.CAPTURE_STOPPED, appliedTile);
	}
};
