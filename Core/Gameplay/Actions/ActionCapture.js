"use strict";

var Actions = Actions || {};
Actions.Classes = Actions.Classes || {};

Actions.Classes.ActionCapture = new function () {
	
	this.actionName = 'ActionCapture';
	
	this.getAvailableActions = function (eworld, world, player, placeable, outActions) {
		var tile = placeable.CTilePlaceable.tile;

		// TODO: This should be done automatically, once unit have movement turns. Remove dependency.
		if (tile.CTileOwner && tile.CTileOwner.beingCapturedBy == placeable) {
			return;
		}

		var playersData = eworld.extract(PlayersData);
		
		if (tile.CTileOwner) {
			var owner = tile.CTileOwner.owner;

			if (owner == null || playersData.getRelation(owner, player) != PlayersData.Relation.Ally) {

				var action = new GameAction(Actions.Classes.ActionCapture, player, placeable);
				outActions.push(action);
			}
		}
	};
	
	this.executeAction = function (eworld, world, action) {
		
		var appliedTile = action.placeable.CTilePlaceable.tile;
		appliedTile.CTileOwner.beingCapturedBy = action.placeable;
		appliedTile.CTileOwner.captureTurns = 1;
		
		eworld.trigger(GameplayEvents.Structures.CAPTURE_STARTED, appliedTile);
	}
};
