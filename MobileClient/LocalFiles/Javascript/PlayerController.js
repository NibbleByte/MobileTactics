//===============================================
// PlayerController
// The player controls, executor and bridge between components.
//===============================================
"use strict";

// DEBUG: global Access
var executor;
var selected;

var PlayerController = function (m_world, m_executor) {
	var self = this;
	
	var m_gameState = null;
	var m_selectedTile = null;
	var m_selectedGOActions = null;
	var m_inputActive = true;
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADING, onGameLoading);
		
		self._eworldSB.subscribe(ClientEvents.Input.TILE_CLICKED, onTileClicked);
		self._eworldSB.subscribe(EngineEvents.World.TILE_REMOVED, onTileRemoved);

		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, clearActions);
		self._eworldSB.subscribe(GameplayEvents.GameState.NO_PLAYING_PLAYERS, clearActions);
		
		self._eworldSB.subscribe(ClientEvents.Controller.ACTIONS_CLEARED, onActionsCleared);
		self._eworldSB.subscribe(ClientEvents.Controller.ACTIONS_OFFERED, onActionsOffered);
	};
	
	this.uninitialize = function () {
		m_gameState = null;
		m_selectedTile = null;
		m_selectedGOActions = null;
	};
	
	var onGameLoading = function (event) {
		m_gameState = self._eworld.extract(GameState);
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
					self._eworld.trigger(ClientEvents.Controller.ACTIONS_CLEARED);
					
					self._eworld.trigger(ClientEvents.Controller.ACTION_PREEXECUTE, selectedAction);
					
				} else {
					
					var availableGOActions = m_executor.getAvailableActions(m_selectedTile);
					
					if (availableGOActions.length > 0) {
						// DEBUG: Select the first unit actions only
						self._eworld.trigger(ClientEvents.Controller.ACTIONS_OFFERED, [availableGOActions[0].actions]);
					} else {
						self._eworld.trigger(ClientEvents.Controller.ACTIONS_CLEARED);
					}
				}
			
			m_selectedTile.CTileRendering.select();
			
		} else {
			// Unselect any action tiles
			self._eworld.trigger(ClientEvents.Controller.ACTIONS_CLEARED);
		}	
	}
	
	
	var onTileClicked = function(event, tile) {
		
		if (m_inputActive) {
			selectTile(tile);
		}
	}

	var onTileRemoved = function (event) {
		clearActions();
		m_selectedTile = null;
		selected = null;
	}
	
	var clearActions = function() {
		self._eworld.trigger(ClientEvents.Controller.ACTIONS_CLEARED);
	}
	
	
	var onActionsCleared = function(event) {
		clearSelectedGOActions();
	}
	
	var onActionsOffered = function(event, actions) {
		m_inputActive = true;
		clearSelectedGOActions();
		
		if (actions.length > 0)
			selectGOActions(actions);
	}
	
	
	//
	// Action selection helpers
	//
	var isGOSelected = function () {
		return !!m_selectedGOActions;
	}
	
	var selectGOActions = function (actions) {
		m_selectedGOActions = actions;
		
		GameExecutor.iterateOverActionTiles(m_selectedGOActions, function (tile, action) {
			ActionsRender.highlightTile(tile, action.actionType);
		});
	}
	
	var getSelectedGOActionTile = function (selectedTile) {
		var selectedAction = null;
		
		GameExecutor.iterateOverActionTiles(m_selectedGOActions, function (tile, action) {
			if (tile == selectedTile) {
				selectedAction = action;
				
				return false;
			}
		});
		
		return selectedAction;
	}
	
	var clearSelectedGOActions = function () {
		if (isGOSelected()){
			GameExecutor.iterateOverActionTiles(m_selectedGOActions, ActionsRender.unHighlightTile);
			
			m_selectedGOActions = null;
		}
	}
}

ECS.EntityManager.registerSystem('PlayerController', PlayerController);
SystemsUtils.supplySubscriber(PlayerController);