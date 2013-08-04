"use strict";

var ActionAttack = new function () {
	
	this.getAvailableActions = function (world, placeable, outActions) {
		var tile = placeable.CTilePlaceable.tile;
		
		var placeables = world.getPlaceablesInArea(tile, 2, placeable); // TODO: Get radius from statistics
		
		var availableTiles = [];
		for(var i = 0; i < placeables.length; ++i) {
			availableTiles.push(placeables[i].CTilePlaceable.tile);
		}
		
		
		var action = new GameAction(ActionAttack, placeable);
		action.availableTiles = availableTiles;
		
		outActions.push(action);
	};
	
	this.executeAction = function (action) {
		// TODO: Modify statistics properly
		/*action.appliedTile.getPlacedObjects()[0].addHealth(-go_this.getStatistics()['Attack']);
		
		console.log("Attack at: " + action.appliedTile.row() + ", " + action.appliedTile.column()
				+ ' Damage: ' + go_this.getStatistics()['Attack']
				+ ' Health: ' + go_this.health());*/
		// TODO: REFACTOR
		console.log('Attacked!');
	}
};
