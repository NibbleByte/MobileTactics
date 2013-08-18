//===============================================
// GameExecutor
// Provides different gameplay queries.
//===============================================
"use strict";

var GameExecutor = function (world) {
	console.assert(world instanceof GameWorld, "GameWorld is required.");
	
	this.createObjectAt = function (tile) {
		
		var obj = UnitsFactory.createUnit(world.getEntityWorld());
		
		m_world.registerPlaceableAt(obj, tile);
		
		return obj;
	}
	
	
	this.destroyObject = function (placeable) {
		placeable.destroy();
	}
	
	
	
	this.getAvailableActions = function(tile) {
		var availableActions = [];
		var objects = tile.CTile.placedObjects;
				
		var actions;
		for(var i = 0; i < objects.length; ++i) {
			var placeable = objects[i];
			var actions = getPlaceableActions(placeable);
			availableActions.push(new GameObjectActions(placeable, actions));
		}
		
		return availableActions;
	}
	
	this.executeAction = function(action) {
		console.assert(action instanceof GameAction, "GameAction is required.");
		console.assert(action.appliedTile, "Action not applied to tile.");
		
		var placeable = action.placeable;
		action.actionType.executeAction(m_world, action);

		return getPlaceableActions(placeable);
	}
	
	var getPlaceableActions = function (placeable) {
		var actions = [];
		
		for(var j = 0; j < placeable.CActions.actions.length; ++j) {
			var action = placeable.CActions.actions[j];
			
			action.getAvailableActions(m_world, placeable, actions);
		}
		
		return actions;		
	}
	
	//
	// Private
	// 
	var m_world = world;
}

ECS.EntityManager.registerSystem('GameExecutor', GameExecutor);

var GameAction = function (actionType, placeable) {
	this.actionType = actionType;			// The responsible component.
	this.placeable = placeable; 			// Placeable that will be executing the action.
	this.availableTiles = [];				// Available tiles on which player can execute action. 
	this.affectedTiles = [];				// Tiles affected if player executes this action. 
	this.appliedTile = null;				// Tile that action is applied to (example: move to this tile).
}

var GameObjectActions = function (go, actions) {
	this.go = go;							// Game object that has these actions
	this.actions = actions;					// Actions available about this GO
}