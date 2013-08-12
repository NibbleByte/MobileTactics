"use strict";

var ActionAttack = new function () {
	
	this.getAvailableActions = function (world, placeable, outActions) {
		var tile = placeable.CTilePlaceable.tile;
		
		var placeables = world.getPlaceablesInArea(tile, placeable.CStatistics.statistics['AttackRange'], placeable);
		
		var availableTiles = [];
		for(var i = 0; i < placeables.length; ++i) {
			availableTiles.push(placeables[i].CTilePlaceable.tile);
		}
		
		
		var action = new GameAction(ActionAttack, placeable);
		action.availableTiles = availableTiles;
		
		outActions.push(action);
	};
	
	this.executeAction = function (world, action) {
		// TODO: Modify statistics properly, taking the defence as well.
		var enemy = action.appliedTile.CTile.placedObjects[0];
		var damage = action.placeable.CStatistics.statistics['Attack'];
		
		enemy.CUnit.health -= damage;
		
		var eworld = world.getEntityWorld();
		if (enemy.CUnit.health > 0) {
			eworld.trigger(GameplayEvents.Units.UNIT_CHANGED, enemy);
			
		} else {
			eworld.trigger(GameplayEvents.Units.UNIT_DESTROYED, enemy);
			world.unregisterPlaceable(enemy);
			enemy.destroy();
		}
		
		// DEBUG: print attack info
		console.log("Attack at: " + action.appliedTile.CTile.row + ", " + action.appliedTile.CTile.column
				+ ' Damage: ' + damage
				+ ' Health: ' + enemy.CUnit.health);
	}
};
