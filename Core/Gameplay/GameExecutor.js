//===============================================
// GameExecutor
// Provides different gameplay queries.
//===============================================
"use strict";

var GameExecutor = function (world) {
	console.assert(world instanceof GameWorld, "GameWorld is required.");
	
	
	this.createObjectAt = function (tile) {
		
		// DEBUG
		var obj = new Entity();
		EntityManager.addComponents(obj, CTilePlaceable);
		EntityManager.addComponents(obj, CActionMove);
		EntityManager.addComponents(obj, CActionAttack);
		
		var ind = Math.floor(Math.random() * 3);
		switch (ind)
		{
			case 0: obj.skin('WarMiner'); break;
			case 1: obj.skin('RhinoTank'); break;
			case 2: obj.skin('TeslaTrooper'); break;
		};
		
		m_world.registerPlaceableAt(obj, tile);
		
		return obj;
	}
	
	
	this.destroyObject = function (placeable) {
		console.assert(m_world.unregisterPlaceable(placeable));
		
		placeable.destroy();
	}
	
	
	
	
	this.getAvailableActions = function(tile) {
		var availableActions = [];
		var objects = tile.getPlacedObjects();
				
		var actions;
		for(var i in objects) {
			var go = objects[i];
			actions = [];
			go.getAvailableActions(actions);
			availableActions.push(new GameObjectActions(go, actions));
		}
		
		return availableActions;
	}
	
	this.executeAction = function(action) {
		console.assert(action instanceof GameAction, "GameAction is required.");
		console.assert(action.appliedTile, "Action not applied to tile.");
		
		var go = action.sourceGO;
		var executingComponent = go.getComponentById(action.componentId);
		executingComponent.executeAction(action);
		
		var actions = [];
		go.getAvailableActions(actions);
		return actions;
	}
	
	//
	// Private
	// 
	var m_world = world;
}

var GameAction = function (componentId, go) {
	this.componentId = componentId;			// The responsible component.
	this.sourceGO = go;						// Placed game object that will be executing the action.
	this.availableTiles = [];				// Available tiles on which player can execute action. 
	this.affectedTiles = [];				// Tiles affected if player executes this action. 
	this.appliedTile = null;				// Tile that action is applied to (example: move to this tile).
}

var GameObjectActions = function (go, actions) {
	this.go = go;							// Game object that has these actions
	this.actions = actions;					// Actions available about this GO
}