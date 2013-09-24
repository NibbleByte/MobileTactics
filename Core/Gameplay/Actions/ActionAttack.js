"use strict";

var Actions = Actions || {};
Actions.Classes = Actions.Classes || {};

Actions.Classes.ActionAttack = new function () {
	
	this.actionName = 'ActionAttack';
	
	this.getAvailableActions = function (world, placeable, outActions) {
		var tile = placeable.CTilePlaceable.tile;
		
		var placeables = world.getPlaceablesInArea(tile, placeable.CStatistics.statistics['AttackRange'], placeable);
		
		// If no targets, action is unavailable.
		if (placeables.length == 0) {
			return;
		}
		
		var availableTiles = [];
		for(var i = 0; i < placeables.length; ++i) {
			availableTiles.push(placeables[i].CTilePlaceable.tile);
		}
		
		
		var action = new GameAction(Actions.Classes.ActionAttack, placeable);
		action.availableTiles = availableTiles;
		
		outActions.push(action);
	};
	
	this.executeAction = function (world, action) {
		// TODO: Modify statistics properly, taking the defence as well.
		var enemy = action.appliedTile.CTile.placedObjects[0];
		var damage = action.placeable.CStatistics.statistics['Attack'];
		
		enemy.CUnit.health -= damage;
		
		var eworld = world.getEntityWorld();
		eworld.trigger(GameplayEvents.Units.UNIT_CHANGED, enemy);
		
		// DEBUG: print attack info
		console.log("Attack at: " + action.appliedTile.CTile.row + ", " + action.appliedTile.CTile.column
				+ ' Damage: ' + damage
				+ ' Health: ' + enemy.CUnit.health);
	}
};
