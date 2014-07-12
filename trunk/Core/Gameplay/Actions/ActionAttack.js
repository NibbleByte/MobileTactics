"use strict";

var Actions = Actions || {};
Actions.Classes = Actions.Classes || {};

Actions.Classes.ActionAttack = new function () {
	
	this.actionName = 'ActionAttack';
	this.quickAction = false;
	
	this.getAvailableActions = function (eworld, world, player, placeable, outActions) {

		if (placeable.CUnit.actionsData.hasExecutedAction(this))
			return;

		var tile = placeable.CTilePlaceable.tile;
		
		var placeables = world.getPlaceablesInArea(tile, placeable.CStatistics.statistics['AttackRange'], placeable);
		var playersData = eworld.extract(PlayersData);
		
		var availableTiles = [];
		for(var i = 0; i < placeables.length; ++i) {
			if (playersData.getRelation(placeables[i].CPlayerData.player, player) == PlayersData.Relation.Enemy	&&
				placeables[i].CTilePlaceable.tile.CTileVisibility.visible
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
		// TODO: Modify statistics properly, taking the defence as well.
		var enemy = action.appliedTile.CTile.placedObjects[0];
		var damage = action.placeable.CStatistics.statistics['Attack'];
		
		enemy.CUnit.health -= damage;
		
		// Not previewing any more. Shit just got real!
		action.placeable.CUnit.actionsData.previewOriginalTile = null;

		if (!action.placeable.CStatistics.statistics['MovementAttack']) {
			action.placeable.CUnit.finishedTurn = true;
		}

		// DEBUG: print attack info
		console.log("Attack at: " + action.appliedTile.CTile.row + ", " + action.appliedTile.CTile.column
				+ ' Damage: ' + damage
				+ ' Health: ' + enemy.CUnit.health);
		
		eworld.trigger(GameplayEvents.Units.UNIT_CHANGED, enemy);
	}

};
