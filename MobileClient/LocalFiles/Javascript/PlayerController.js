//===============================================
// PlayerController
// The player controls, executor and bridge between components.
//===============================================
"use strict";

// DEBUG: global Access
var executor;
var selected;

var PlayerController = function (m_world, m_executor) {
	var m_eworld = null;
	var m_eworldSB = null;
	var m_gameState = null;

	var m_selectedTile = null;
	
	var m_selectedGOActions = null;
	
	var m_inputActive = true;
	
	//
	// Entity system initialize
	//
	this.onAdded = function () {
		m_eworld = this.getEntityWorld();
		m_eworldSB = m_eworld.createSubscriber();
		
		m_eworldSB.subscribe(EngineEvents.General.GAME_LOADED, onGameLoaded);
		
		m_eworldSB.subscribe(ClientEvents.Input.TILE_CLICKED, onTileClicked);
		m_eworldSB.subscribe(EngineEvents.World.TILE_REMOVED, onTileRemoved);
		
		m_eworldSB.subscribe(ClientEvents.Controller.ACTIONS_CLEARED, onActionsCleared);
		m_eworldSB.subscribe(ClientEvents.Controller.ACTIONS_OFFERED, onActionsOffered);
	};
	
	this.onRemoved = function () {
		m_eworldSB.unsubscribeAll();
		m_eworldSB = null;
		m_eworld = null;
		
		m_gameState = null;
		m_selectedTile = null;
		m_selectedGOActions = null;
	};
	
	var onGameLoaded = function (event) {
		m_gameState = m_eworld.extract(GameState);
	}
	
	// DEBUG: Global access
	executor = m_executor;
	
	var selectTile = function (tile) {
		// DEBUG: if tile is the same, place object
		if (tile && tile == m_selectedTile 
				&& tile.CTile.placedObjects.length == 0
				&& m_gameState.currentPlayer != null
				) {
			
			m_executor.createObjectAt(tile, m_gameState.currentPlayer);
			return;
		}
		
		
		if (m_selectedTile)
			m_selectedTile.CTileRendering.unSelect();
		
		m_selectedTile = tile;
		
		// DEBUG: global access
		selected = m_selectedTile;
		var selectedAction = null;
		
		if (m_selectedTile) {
			
			if (isGOSelected())
				selectedAction = getSelectedGOActionTile(m_selectedTile)
				
				// Picked action
				if (selectedAction && m_gameState.currentPlayer == selectedAction.player) {
					
					// Apply and execute the action
					selectedAction.appliedTile = tile;
					
					
					m_inputActive = false;
					m_eworld.trigger(ClientEvents.Controller.ACTIONS_CLEARED);
					
					m_eworld.trigger(ClientEvents.Controller.ACTION_PREEXECUTE, selectedAction);
					
				} else {
					
					var availableGOActions = m_executor.getAvailableActions(m_selectedTile);
					
					if (availableGOActions.length > 0) {
						// DEBUG: Select the first unit actions only
						m_eworld.trigger(ClientEvents.Controller.ACTIONS_OFFERED, [availableGOActions[0].actions]);
					} else {
						m_eworld.trigger(ClientEvents.Controller.ACTIONS_CLEARED);
					}
				}
			
			m_selectedTile.CTileRendering.select();
			
		} else {
			// Unselect any action tiles
			m_eworld.trigger(ClientEvents.Controller.ACTIONS_CLEARED);
		}	
	}
	
	
	var onTileClicked = function(event, tile) {
		
		if (m_inputActive) {
			selectTile(tile);
		}
	}
	
	var onTileRemoved = function(event, tile) {
		clearSelectedGOActions();
		m_selectedTile = null;
	}
	
	
	var onActionsCleared = function(event) {
		clearSelectedGOActions();
	}
	
	var onActionsOffered = function(event, actions) {
		m_inputActive = true;
		clearSelectedGOActions();
		
		if (actions.length > 0)
			selectGOActions(actions);
		
		drawFog(actions);
	}
	
	var drawFog = function (actions) {
		
		var moveAction = null;
		var attackAction = null;
		for (var i = 0; i < actions.length; ++i) {
			if (actions[i].actionType == Actions.Classes.ActionMove) {
				moveAction = actions[i];
			}
			
			if (actions[i].actionType == Actions.Classes.ActionAttack) {
				attackAction = actions[i];
			}
		}
		
		if (moveAction == null && attackAction == null)
			return;
		
		var placeableTile = moveAction.placeable.CTilePlaceable.tile;
		
		m_world.iterateAllTiles(function (tile) {
			
			if ((moveAction != null && moveAction.availableTiles.indexOf(tile) != -1)
				|| (attackAction != null && attackAction.availableTiles.indexOf(tile) != -1)
				|| tile == placeableTile
				) {
				tile.CTileRendering.hideFog();
			} else {
				tile.CTileRendering.showFog();
			}
		});
	}
	
	var clearFog = function () {
		m_world.iterateAllTiles(function (tile) {
			tile.CTileRendering.hideFog();
		});
	}
	
	
	
	
	//
	// Action selection helpers
	//
	var isGOSelected = function () {
		return !!m_selectedGOActions;
	}
	
	var selectGOActions = function (actions) {
		m_selectedGOActions = actions;
		
		iterateOverActionTiles(m_selectedGOActions, function (tile, action) {
			ActionsRender.highlightTile(tile, action.actionType);
		});
	}
	
	var getSelectedGOActionTile = function (selectedTile) {
		var selectedAction = null;
		
		iterateOverActionTiles(m_selectedGOActions, function (tile, action) {
			if (tile == selectedTile) {
				selectedAction = action;
				
				return false;
			}
		});
		
		return selectedAction;
	}
	
	var clearSelectedGOActions = function () {
		if (isGOSelected()){
			iterateOverActionTiles(m_selectedGOActions, ActionsRender.unHighlightTile);
			
			m_selectedGOActions = null;
			
			clearFog();
		}
	}
	
	var iterateOverActionTiles = function (actions, handler) {
		// All the actions
		for(var i = 0; i < actions.length; ++i) {
			var action = actions[i];
			
			// All the available tiles for this action
			for(var j = 0; j < action.availableTiles.length; ++j) {
				var tile = action.availableTiles[j];
				if (handler(tile, action) === false)
					return;
			}
		}
	}
}

ECS.EntityManager.registerSystem('PlayerController', PlayerController);