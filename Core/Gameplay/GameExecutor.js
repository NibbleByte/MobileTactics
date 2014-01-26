//===============================================
// GameExecutor
// Provides different gameplay queries.
//===============================================
"use strict";

var GameExecutor = function (eworld, world) {
	console.assert(world instanceof GameWorld, "GameWorld is required.");
	
	this.createObjectAt = function (tile, player) {
		
		var ind = Math.floor(Math.random() * 3);
		var unitName = 'Unknown';
		switch (ind)
		{
		case 0: unitName = 'WarMiner'; break;
		case 1: unitName = 'RhinoTank';	break;
		case 2: unitName = 'TeslaTrooper'; break;
		};
		
		
		var obj = UnitsFactory.createUnit(unitName, player);
		
		// TODO: Remove testing effects.
		var effect = new Effect();
		effect.addStatisticModifier('Attack', 20);
		obj.CEffects.effects.push(effect);
		
		effect = new Effect();
		effect.addStatisticModifier('Attack', -30);
		effect.timeLeft = 2;
		obj.CEffects.effects.push(effect);
		
		
		
		m_eworld.addUnmanagedEntity(obj);
		m_world.place(obj, tile);
		
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
			var player = placeable.CPlayerData.player;
			var actions = getPlaceableActions(player, placeable);
			availableActions.push(new GameObjectActions(placeable, actions));
		}
		
		return availableActions;
	}
	
	this.executeAction = function(action) {
		console.assert(action instanceof GameAction, "GameAction is required.");
		console.assert(action.appliedTile, "Action not applied to tile.");
		
		var placeable = action.placeable;
		action.actionType.executeAction(m_eworld, m_world, action);

		return getPlaceableActions(action.player, placeable);
	}
	
	var getPlaceableActions = function (player, placeable) {
		var actions = [];
		
		for(var j = 0; j < placeable.CActions.actions.length; ++j) {
			var action = placeable.CActions.actions[j];
			
			action.getAvailableActions(m_eworld, m_world, player, placeable, actions);
		}
		
		return actions;		
	}
	
	//
	// Private
	// 
	var m_world = world;
	var m_eworld = eworld;
	var m_playersData = m_eworld.blackboard[PlayersData.BLACKBOARD_NAME];
}

ECS.EntityManager.registerSystem('GameExecutor', GameExecutor);

var GameAction = function (actionType, player, placeable) {
	this.actionType = actionType;			// The responsible component.
	this.player = player; 					// Player that will execute the action.
	this.placeable = placeable; 			// Placeable that will be executing the action.
	this.availableTiles = [];				// Available tiles on which player can execute action. 
	this.affectedTiles = [];				// Tiles affected if player executes this action. 
	this.appliedTile = null;				// Tile that action is applied to (example: move to this tile).
}

var GameObjectActions = function (go, actions) {
	this.go = go;							// Game object that has these actions
	this.actions = actions;					// Actions available about this GO
}