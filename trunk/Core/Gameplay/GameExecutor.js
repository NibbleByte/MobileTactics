//===============================================
// GameExecutor
// Provides different gameplay queries.
//===============================================
"use strict";

var GameExecutor = function (eworld, world) {
	console.assert(world instanceof GameWorld, "GameWorld is required.");
	
	this.createObjectAt = function (tile, player) {
		
		var obj = UnitsFactory.createUnit(Utils.randomPropertyValue(UnitsDefinitions[player.race]), player);
		
		// TODO: Remove testing effects.
		var effect = new Effect();
		effect.addStatisticModifier('Attack', 20);
		//obj.CEffects.effects.push(effect);
		
		effect = new Effect();
		effect.addStatisticModifier('Attack', -30);
		effect.timeLeft = 2;
		//obj.CEffects.effects.push(effect);
		
		
		
		m_eworld.addUnmanagedEntity(obj);
		m_world.place(obj, tile);
		
		return obj;
	}
	
	
	this.getAvailableActions = function(tile) {
		var availableActions = [];
		var objects = tile.CTile.placedObjects;

		// If not visible, no placeables, actions are possible.
		if (!tile.CTileVisibility.visible) {
			return availableActions;
		}
		
		var gameState = eworld.extract(GameState);

		var actions;
		for(var i = 0; i < objects.length; ++i) {
			var placeable = objects[i];

			if (CTileOwner.isCapturing(placeable))
				continue;

			if (placeable.CUnit.finishedTurn && placeable.CPlayerData.player == gameState.currentPlayer)
				continue;

			var player = placeable.CPlayerData.player;
			var actions = getPlaceableActions(player, placeable);
			availableActions.push(new GameObjectActions(placeable, actions));
		}
		
		return availableActions;
	}
	
	this.executeAction = function(action) {
		console.assert(action instanceof GameAction, "GameAction is required.");
		
		var placeable = action.placeable;
		var prevTurnPoints = action.placeable.CUnit.turnPoints;

		m_eworld.blackboard[GameplayBlackBoard.Actions.CURRENT_ACTION] = action;

		action.actionType.executeAction(m_eworld, m_world, action);
		m_executedActions.push(action);
		placeable.CUnit.actionsData.addExecutedAction(prevTurnPoints, action.actionType);

		m_eworld.blackboard[GameplayBlackBoard.Actions.CURRENT_ACTION] = null;

		// If turn points passed, consider this as a second turn.
		if (prevTurnPoints != placeable.CUnit.turnPoints) {

			// If no more turn points left, finish turn.
			if (placeable.CUnit.turnPoints == 0) {
				placeable.CUnit.finishedTurn = true;
			}
		}


		// Refresh visibility.
		if (action.actionType.shouldRefreshVisibility) {
			world.place(placeable, placeable.CTilePlaceable.tile);
		}

		// Placeable might got destroyed during the action.
		if (placeable.destroyed || !placeable.isAttached() || prevTurnPoints != placeable.CUnit.turnPoints) {
			return null;
		}

		return new GameObjectActions(placeable, getPlaceableActions(action.player, placeable));
	}

	this.getLastExecutedAction = function () {
		if (m_executedActions.length > 0) {
			return m_executedActions[m_executedActions.length - 1];
		} else {
			return null;
		}
	}

	this.undoLastAction = function () {
		
		var action = m_executedActions.pop();

		if (Utils.assert(action))
			return null;


		var placeable = action.placeable;
		var prevTurnPoints = action.placeable.CUnit.turnPoints;

		m_eworld.blackboard[GameplayBlackBoard.Actions.CURRENT_ACTION] = action;

		action.actionType.undoAction(m_eworld, m_world, action);
		placeable.CUnit.actionsData.removeLastExecutedAction(action.placeable.CUnit.turnPoints, action.actionType);	// The order is not guaranteed.

		m_eworld.blackboard[GameplayBlackBoard.Actions.CURRENT_ACTION] = null;

		// Turn might just have been restored.
		if (prevTurnPoints != placeable.CUnit.turnPoints) {
			if (placeable.CUnit.turnPoints > 0) {
				placeable.CUnit.finishedTurn = false;
			}
		}


		// Refresh visibility.
		if (action.actionType.shouldRefreshVisibility) {
			world.place(placeable, placeable.CTilePlaceable.tile);
		}

		return new GameObjectActions(action.placeable, getPlaceableActions(action.placeable.CPlayerData.player, action.placeable));
	}
	
	// On turn changing, clear any stacked actions, as turn changing is not tracked by the GameManager (effects, other player actions etc.)
	this.clearExecutedActions = function () {
		m_executedActions = [];
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
	var m_executedActions = [];
}

GameExecutor.iterateOverActionTiles = function (actions, handler) {
	// All the actions
	for(var i = 0; i < actions.length; ++i) {
		var action = actions[i];

		if (action.availableTiles == null)
			continue;
		
		// All the available tiles for this action
		for(var j = 0; j < action.availableTiles.length; ++j) {
			var tile = action.availableTiles[j];
			if (handler(tile, action) === false)
				return;
		}
	}
}

var GameAction = function (actionType, player, placeable) {
	this.actionType = actionType;			// The responsible component.
	this.player = player; 					// Player that will execute the action.
	this.placeable = placeable; 			// Placeable that will be executing the action.
	this.availableTiles = null;				// Available tiles on which player can execute action. Null is for instant action.
	this.affectedTiles = [];				// Tiles affected if player executes this action. 
	this.appliedTile = null;				// Tile that action is applied to (example: move to this tile).
	this.undoData = {};						// Custom data that can be used for undo (if possible at all).
}

var GameObjectActions = function (go, actions) {
	this.go = go;							// Game object that has these actions
	this.actions = actions;					// Actions available about this GO
}