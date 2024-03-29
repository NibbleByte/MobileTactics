//===============================================
// GameExecutor
// Provides different gameplay queries.
//===============================================
"use strict";

var GameExecutor = function (m_eworld, m_world) {
	console.assert(m_world instanceof GameWorld, "GameWorld is required.");
	
	this.createObjectAt = function (tile, player) {
		
		var placeable = UnitsFactory.createUnit(Utils.randomPropertyValue(UnitsDefinitions[player.race]), player);
		
		// TODO: Remove testing effects.
		var effect = new Effect();
		effect.addStatisticModifier('AttackMultiplier', 20);
		//placeable.CEffects.effects.push(effect);
		
		effect = new Effect();
		effect.addStatisticModifier('AttackMultiplier', -30);
		effect.timeLeft = 2;
		//placeable.CEffects.effects.push(effect);


		var action = new GameAction(Actions.Classes.ActionCreate, player, placeable);
		action.appliedTile = tile;
		
		this.executeAction(action);

		// Placeable starts with a clean slate
		placeable.CUnit.actionsData.clearExecutedActions();
		
		return placeable;
	}
	
	
	// tile or placeable (and returns array or single object
	this.getAvailableActions = function(tileOrPlaceable) {
		if (Utils.assert(tileOrPlaceable.isAttached(), 'Trying to get actions for destroyed object.'))
			return null;
		
		var tile = tileOrPlaceable;
		if (tile.CTilePlaceable)
			tile = tile.CTilePlaceable.tile;

		var isTile = tile == tileOrPlaceable;
		var availableActions = (isTile) ? [] : null;
		var objects = tile.CTile.placedObjects;

		// If not visible, no placeables, actions are possible.
		if (!tile.CTileVisibility.visible) {
			return availableActions;
		}
		
		var gameState = m_eworld.extract(GameState);

		var actions;
		for(var i = 0; i < objects.length; ++i) {
			var placeable = objects[i];

			if (CTileOwner.isCapturing(placeable))
				continue;

			if (placeable.CUnit.finishedTurn && placeable.CPlayerData.player == gameState.currentPlayer)
				continue;

			if (!isTile && placeable != tileOrPlaceable)
				continue;


			var player = placeable.CPlayerData.player;
			var actions = getPlaceableActions(player, placeable);


			if (!isTile && placeable == tileOrPlaceable) 
				return new GameObjectActions(placeable, actions);

			availableActions.push(new GameObjectActions(placeable, actions));
		}
		
		return availableActions;
	}
	
	this.executeAction = function(action) {
		console.assert(action instanceof GameAction, "GameAction is required.");

		// When creating new unit (not placed on any tile yet), it might still not be attached.
		if (Utils.assert(action.placeable.isAttached() || action.placeable.CTilePlaceable.tile == null, 'Trying to execute actions for destroyed object.'))
			return null;
		
		var placeable = action.placeable;
		var prevTurnPoints = action.placeable.CUnit.turnPoints;

		m_eworld.blackboard[GameplayBlackBoard.Actions.CURRENT_ACTION] = action;

		placeable.CUnit.actionsData.currentActionType = action.actionType;
		action.actionType.executeAction(m_eworld, m_world, action);
		m_executedActions.push(action);
		placeable.CUnit.actionsData.currentActionType = null;
		placeable.CUnit.actionsData.addExecutedAction(prevTurnPoints, action.actionType);

		m_eworld.blackboard[GameplayBlackBoard.Actions.CURRENT_ACTION] = null;

		// If turn points passed, consider this as a second turn.
		if (prevTurnPoints != placeable.CUnit.turnPoints) {

			// If no more turn points left, finish turn.
			if (placeable.CUnit.turnPoints == 0) {
				placeable.CUnit.finishedTurn = true;
			}

			if (!placeable.destroyed && placeable.isAttached()) {
				m_eworld.trigger(GameplayEvents.Units.UNIT_TURN_POINTS_CHANGED, placeable);
			}

			return null;
		}

		// Placeable might got destroyed during the action.
		if (placeable.destroyed || !placeable.isAttached()) {
			return null;
		}

		return new GameObjectActions(placeable, getPlaceableActions(action.player, placeable));
	}

	this.getLastExecutedAction = function () {
		if (m_executedActions.length > 0) {
			return m_executedActions.last();
		} else {
			return null;
		}
	}

	this.canUndo = function () {
		if (m_executedActions.length > 0) {
			return !!m_executedActions.last().actionType.undoAction;
		} else {
			return false;
		}
	}

	this.undoLastAction = function () {
		
		if (!this.canUndo())
			return;
		
		var action = m_executedActions.pop();

		if (Utils.assert(action))
			return null;


		var placeable = action.placeable;
		var prevTurnPoints = action.placeable.CUnit.turnPoints;

		m_eworld.blackboard[GameplayBlackBoard.Actions.CURRENT_ACTION] = action;

		placeable.CUnit.actionsData.currentActionType = action.actionType;
		action.actionType.undoAction(m_eworld, m_world, action);
		placeable.CUnit.actionsData.currentActionType = null;
		placeable.CUnit.actionsData.removeLastExecutedAction(action.placeable.CUnit.turnPoints, action.actionType);
		// NOTE: some actions might not be in placeable.CUnit.actionsData on undo, for example ActionCreate.

		m_eworld.blackboard[GameplayBlackBoard.Actions.CURRENT_ACTION] = null;

		// Turn might just have been restored.
		if (prevTurnPoints != placeable.CUnit.turnPoints) {
			if (placeable.CUnit.turnPoints > 0) {
				placeable.CUnit.finishedTurn = false;
			}

			if (placeable.isAttached()) {
				m_eworld.trigger(GameplayEvents.Units.UNIT_TURN_POINTS_CHANGED, placeable);
			}
		}


		// Refresh visibility.
		if (placeable.isAttached()) {
			m_eworld.triggerAsync(GameplayEvents.Visibility.FORCE_VISIBILITY_REFRESH);
		}

		if (placeable.isAttached()) {
			return new GameObjectActions(action.placeable, getPlaceableActions(action.placeable.CPlayerData.player, action.placeable));
		} else {
			return null;
		}
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
	var m_executedActions = [];
}

GameExecutor.iterateOverActionTiles = function (actions, handler) {
	
	for(var i = 0; i < actions.length; ++i) {
		var action = actions[i];

		if (action.availableTiles) {
			for(var j = 0; j < action.availableTiles.length; ++j) {
				var tile = action.availableTiles[j];
				if (handler(tile, action, GameAction.TileType.Available) === false)
					return;
			}
		}
		
		if (action.affectedTiles) {
			for(var j = 0; j < action.affectedTiles.length; ++j) {
				var tile = action.affectedTiles[j];
				if (handler(tile, action, GameAction.TileType.Affected) === false)
					return;
			}
		}
		

		if (action.potentialTiles) {
			for(var j = 0; j < action.potentialTiles.length; ++j) {
				var tile = action.potentialTiles[j];
				if (handler(tile, action, GameAction.TileType.Potential) === false)
					return;
			}
		}
	}
}

var GameAction = function (actionType, player, placeable) {
	this.actionType = actionType;			// The responsible component.
	this.player = player; 					// Player that will execute the action.
	this.placeable = placeable; 			// Placeable that will be executing the action.
	this.availableTiles = null;				// Available tiles on which player can execute action. Null is for instant action.
	this.potentialTiles = [];				// Tiles that could have been available, but are invalid for some reason (exists mainly because of the UI).
	this.affectedTiles = [];				// Tiles affected if player executes this action. 
	this.appliedTile = null;				// Tile that action is applied to (example: move to this tile).
	this.undoData = {};						// Custom data that can be used for undo (if possible at all).
}

GameAction.TileType = {
	Available: 0,
	Potential: 0,
	Affected: 0,
}
Enums.enumerate(GameAction.TileType);

var GameObjectActions = function (go, actions) {
	this.go = go;							// Game object that has these actions
	this.actions = actions;					// Actions available about this GO
}

// Return action by type (or null if fails).
GameObjectActions.prototype.getActionByType = function (actionType) {

	for (var i = 0; i < this.actions.length; ++i) {
		if (this.actions[i].actionType == actionType) {
			return this.actions[i];
		}
	}

	return null;
} 