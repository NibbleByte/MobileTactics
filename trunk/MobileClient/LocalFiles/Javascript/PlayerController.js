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
	var m_lastExecutedAction = null;
	var m_inputActive = true;
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADING, onGameLoading);
		
		self._eworldSB.subscribe(ClientEvents.Input.TILE_CLICKED, onTileClicked);
		self._eworldSB.subscribe(EngineEvents.World.TILE_REMOVED, onTileRemoved);

		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGING, onTurnChanging);
		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, clearActions);
		self._eworldSB.subscribe(GameplayEvents.GameState.NO_PLAYING_PLAYERS, clearActions);
		
		self._eworldSB.subscribe(ClientEvents.Controller.ACTIONS_CLEARED, onActionsCleared);
		self._eworldSB.subscribe(ClientEvents.Controller.ACTION_CANCEL, onActionsCancelled);
		self._eworldSB.subscribe(ClientEvents.Controller.ACTION_EXECUTED, onActionExecuted);
		self._eworldSB.subscribe(ClientEvents.Controller.ACTIONS_OFFERED, onActionsOffered);
	};
	
	this.uninitialize = function () {
		m_gameState = null;
		m_selectedTile = null;
		m_selectedGOActions = null;
		m_lastExecutedAction = null;
	};

	this.isHudLocked = function () {
		return !m_inputActive || (
			m_selectedGOActions && (
				m_selectedGOActions.go.CUnit.actionsData.previewOriginalTile || 
				m_selectedGOActions.go.CUnit.actionsData.hasExecutedAction(Actions.Classes.ActionAttack)
			)
		) ;
	}
	
	var onGameLoading = function (event) {
		m_gameState = self._eworld.extract(GameState);
	}
	
	// DEBUG: Global access
	executor = m_executor;

	var selectTileHighlight = function (tile) {
		if (m_selectedTile)
			m_selectedTile.CTileRendering.unSelect();

		m_selectedTile = tile;

		// DEBUG: global access
		selected = m_selectedTile;

		if (m_selectedTile)
			m_selectedTile.CTileRendering.select();
	};
	
	var selectTile = function (tile) {
		// DEBUG: if tile is the same, place object
		if (tile && tile == m_selectedTile 
				&& tile.CTile.placedObjects.length == 0
				&& m_gameState.currentPlayer != null
				) {
			
			m_executor.createObjectAt(tile, m_gameState.currentPlayer);
			return;
		}
		
		selectTileHighlight(tile);

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

				// If in preview, can't select other tile. Must choose valid action or cancel!
				if (m_selectedGOActions && (
							m_selectedGOActions.go.CUnit.actionsData.previewOriginalTile ||
							m_selectedGOActions.go.CUnit.actionsData.hasExecutedAction(Actions.Classes.ActionAttack)
						)
					) {
					// Since selection has changed, re-select back the unit.
					selectTileHighlight(m_selectedGOActions.go.CTilePlaceable.tile);
					return;
				}
				
				m_lastExecutedAction = null;
				var availableGOActions = m_executor.getAvailableActions(m_selectedTile);
					
				if (availableGOActions.length > 0) {
					// DEBUG: Select the first unit actions only
					self._eworld.trigger(ClientEvents.Controller.ACTIONS_OFFERED, [availableGOActions[0]]);
				} else {
					self._eworld.trigger(ClientEvents.Controller.ACTIONS_CLEARED);
				
					if (Store.canPlayerShop(self._eworld, m_selectedTile)) {
						StoreRender.apply(self._eworld, m_selectedTile);
					}
				}
			}

		} else {
			// Unselect any action tiles
			m_lastExecutedAction = null;
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

	var onActionsCancelled = function(event) {
		
		// No action executed yet -> cancel.
		if (m_lastExecutedAction == null) {
			self._eworld.triggerAsync(ClientEvents.Controller.ACTIONS_CLEARED);
			return;
		}

		var goActions = m_executor.undoAction(m_lastExecutedAction);
		m_lastExecutedAction = null;

		if (goActions) {
			selectTileHighlight(goActions.go.CTilePlaceable.tile);
			self._eworld.triggerAsync(ClientEvents.Controller.ACTIONS_OFFERED, [goActions]);
		} else {
			self._eworld.triggerAsync(ClientEvents.Controller.ACTIONS_CLEARED);
		}
	}
	
	var onActionExecuted = function(event, action) {
		m_lastExecutedAction = action;
	}

	var onActionsOffered = function(event, goActions) {
		clearSelectedGOActions();
		
		if (goActions.actions.length > 0)
			selectGOActions(goActions);
	}
	
	var onTurnChanging = function (event, gameState) {

		// Cycle through all current units and check if all have finished their turns.
		// If not, use it for healing, if available.
		for(var i = 0; i < gameState.currentPlaceables.length; ++i) {
			var tile = gameState.currentPlaceables[i].CTilePlaceable.tile;
			var availableGOActions = m_executor.getAvailableActions(tile);

			for(var j = 0; j < availableGOActions.length; ++j) {
				var goActions = availableGOActions[j];

				if (goActions.go.CUnit.finishedTurn)
					continue;

				var action = goActions.actions.find(function (val) { return val.actionType == Actions.Classes.ActionHeal });
				if (action) {
					m_executor.executeAction(action);
					--j; // Needed in order execute all the turnPoints.
				}
			}
		}
	}
	
	//
	// Action selection helpers
	//
	var isGOSelected = function () {
		return !!m_selectedGOActions;
	}
	
	var selectGOActions = function (goActions) {
		m_selectedGOActions = goActions;
		
		GameExecutor.iterateOverActionTiles(m_selectedGOActions.actions, function (tile, action) {
			ActionsRender.highlightTile(tile, action.actionType);
		});
	}
	
	var getSelectedGOActionTile = function (selectedTile) {
		var selectedAction = null;
		
		GameExecutor.iterateOverActionTiles(m_selectedGOActions.actions, function (tile, action) {
			if (tile == selectedTile) {
				selectedAction = action;
				
				return false;
			}
		});
		
		return selectedAction;
	}
	
	var clearSelectedGOActions = function () {
		m_inputActive = true;

		if (isGOSelected()){
			GameExecutor.iterateOverActionTiles(m_selectedGOActions.actions, ActionsRender.unHighlightTile);
			
			m_selectedGOActions = null;
		}
	}
}

ECS.EntityManager.registerSystem('PlayerController', PlayerController);
SystemsUtils.supplySubscriber(PlayerController);