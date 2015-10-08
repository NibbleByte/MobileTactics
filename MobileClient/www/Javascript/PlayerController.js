//===============================================
// PlayerController
// The player controls, executor and bridge between components.
//===============================================
"use strict";

// DEBUG: global Access
var executor;
var selected;
var selectedUnit;

var PlayerController = function (m_executor) {
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
		
		self._eworldSB.subscribe(ClientEvents.Controller.ACTION_EXECUTE, onActionExecute);
		self._eworldSB.subscribe(ClientEvents.Controller.ACTIONS_CLEARED, onActionsCleared);
		self._eworldSB.subscribe(ClientEvents.Controller.ACTION_CANCEL, onActionsCancelled);
		self._eworldSB.subscribe(ClientEvents.Controller.ACTIONS_OFFERED, onActionsOffered);
	};
	
	this.uninitialize = function () {
		m_gameState = null;
		m_selectedTile = null;
		m_selectedGOActions = null;
	};

	this.isHudLocked = function () {
		return !m_inputActive || (
			m_selectedGOActions && 
			m_selectedGOActions.go.CUnit.actionsData.getTurnData(m_selectedGOActions.go.CUnit.turnPoints).executedActions.length > 0
		) ;
	}

	this.undoLastAction = function () {
		onActionsCancelled(true);
	}
	
	var onGameLoading = function () {
		m_gameState = self._eworld.extract(GameState);
	}
	
	// DEBUG: Global access
	executor = m_executor;

	var selectTileHighlight = function (tile) {

		m_selectedTile = tile;
		self._eworld.trigger(ClientEvents.Controller.TILE_SELECTED, m_selectedTile);

		// DEBUG: global access
		selected = m_selectedTile;
		selectedUnit = (m_selectedTile && m_selectedTile.CTile.placedObjects.length > 0) ? m_selectedTile.CTile.placedObjects[0] : null;
	};
	
	var selectTile = function (tile) {

		if (m_gameState.currentPlayer != null && m_gameState.currentPlayer.type != Player.Types.Human)
			return;
		
		selectTileHighlight(tile);

		var selectedAction = null;
		
		if (m_selectedTile) {
			
			if (isGOSelected())
				selectedAction = getSelectedGOActionTile(m_selectedTile)
				
			// Picked action
			if (selectedAction && m_gameState.currentPlayer == selectedAction.player) {
					
				// Apply and execute the action
				selectedAction.appliedTile = tile;
					
					
				self._eworld.trigger(ClientEvents.Controller.ACTIONS_CLEARED);
					
				m_inputActive = false;
				self._eworld.trigger(ClientEvents.Controller.ACTION_PREEXECUTE, selectedAction);
					
			} else {

				// If in preview, can't select other tile. Must choose valid action or cancel!
				if (m_selectedGOActions &&
					m_selectedGOActions.go.CUnit.actionsData.getTurnData(m_selectedGOActions.go.CUnit.turnPoints).executedActions.length > 0
					) {
					// Since selection has changed, re-select back the unit.
					selectTileHighlight(m_selectedGOActions.go.CTilePlaceable.tile);
					return;
				}
				
				var availableGOActions = m_executor.getAvailableActions(m_selectedTile);
					
				if (availableGOActions.length > 0) {
					// DEBUG: Select the first unit actions only
					self._eworld.trigger(ClientEvents.Controller.ACTIONS_OFFERED, availableGOActions[0]);
				} else {
					self._eworld.trigger(ClientEvents.Controller.ACTIONS_CLEARED);
				
					if (Store.canPlayerShop(self._eworld, m_selectedTile)) {
						StoreRender.apply(self._eworld, m_selectedTile);
					}
				}
			}

		} else {

			// If in preview, can't select other tile. Must choose valid action or cancel!
			if (m_selectedGOActions &&
					m_selectedGOActions.go.CUnit.actionsData.getTurnData(m_selectedGOActions.go.CUnit.turnPoints).executedActions.length > 0
					) {
				// Since selection has changed, re-select back the unit.
				selectTileHighlight(m_selectedGOActions.go.CTilePlaceable.tile);
				return;

			} else {

				// Unselect any action tiles
				self._eworld.trigger(ClientEvents.Controller.ACTIONS_CLEARED);
			}
		}	
	}
	
	
	var onTileClicked = function(hitData) {
		
		if (m_inputActive) {
			
			var tile = hitData.tile;

			// DEBUG: place object if shift key is pressed.
			if (hitData.event.originalEvent.originalInputEvent.shiftKey
				&& tile 
				&& tile.CTile.placedObjects.length == 0
				&& m_gameState.currentPlayer != null
				) {

				m_executor.createObjectAt(tile, m_gameState.currentPlayer);
				return;
			}

			selectTile(tile);
		}
	}

	var onTileRemoved = function () {
		clearActions();
		m_selectedTile = null;
		selected = null;
		selectedUnit = null;
	}
	
	var clearActions = function() {
		selectTileHighlight(null);

		self._eworld.trigger(ClientEvents.Controller.ACTIONS_CLEARED);

		m_executor.clearExecutedActions();
	}
	
	
	var onActionExecute = function(action, goActions) {

		if (m_gameState.currentPlayer.type != Player.Types.Human)
			return;

		var goActions = m_executor.executeAction(action);

		// If no more goActions available, clear anyway.
		if (goActions) {
			self._eworld.triggerAsync(ClientEvents.Controller.ACTIONS_OFFERED, goActions);
		} else {
			self._eworld.triggerAsync(ClientEvents.Controller.ACTIONS_CLEARED, goActions);
		}
	}

	var onActionsCleared = function() {
		clearSelectedGOActions();
	}

	var onActionsCancelled = function(debug) {
		
		var lastAction = m_executor.getLastExecutedAction();

		// No action executed yet -> cancel.
		if (lastAction == null) {
			self._eworld.triggerAsync(ClientEvents.Controller.ACTIONS_CLEARED);
			return;
		}

		// Only ActionMove is allowed to undo.
		// DEBUG: remove 'debug', used to undo for debugging.
		if (debug && lastAction.actionType != Actions.Classes.ActionMove) {
			self._eworld.triggerAsync(ClientEvents.Controller.ACTIONS_CLEARED);
			return;
		}


		var goActions = m_executor.undoLastAction();

		if (goActions) {
			selectTileHighlight(goActions.go.CTilePlaceable.tile);
			self._eworld.triggerAsync(ClientEvents.Controller.ACTIONS_OFFERED, goActions);
		} else {
			self._eworld.triggerAsync(ClientEvents.Controller.ACTIONS_CLEARED);
		}
	}

	var onActionsOffered = function(goActions) {
		clearSelectedGOActions();
		
		if (goActions.actions.length > 0)
			selectGOActions(goActions);
	}
	
	//
	// Action selection helpers
	//
	var isGOSelected = function () {
		return !!m_selectedGOActions;
	}
	
	var selectGOActions = function (goActions) {
		m_selectedGOActions = goActions;
		
		GameExecutor.iterateOverActionTiles(m_selectedGOActions.actions, ActionsRender.highlightTileAction);
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