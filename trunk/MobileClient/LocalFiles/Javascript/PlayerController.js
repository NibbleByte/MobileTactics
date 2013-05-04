//===============================================
// PlayerController
// The player controls, executor and bridge between components.
//===============================================
"use strict";

// DEBUG: global Access
var executor;
var selected;

var PlayerController = function (worldRenderer) {
	console.assert(worldRenderer instanceof GameWorldRenderer, "GameWorldRenderer is required.");
	
	var m_worldRenderer = worldRenderer;
	var m_worldRendererSB = worldRenderer.createSubscriber();
	var m_world = m_worldRenderer.getWorld();
	var m_executor = new GameExecutor(m_world);
	var m_selectedTile = null;
	
	var m_selectedGOActions = null;
	
	// DEBUG: Global access
	executor = m_executor;
	
	var selectTile = function (tile) {
		// DEBUG: if tile is the same, place object
		if (tile && tile == m_selectedTile /*&& tile.getPlacedObjects().length == 0*/) {
			m_executor.createObjectAt(tile);
			return;
		}
		
		
		if (m_selectedTile)
			m_selectedTile.unSelect();
		
		m_selectedTile = tile;
		
		// DEBUG: global access
		selected = m_selectedTile;
		var selectedAction = null;
		
		if (m_selectedTile) {
			
			if (isGOSelected())
				selectedAction = getSelectedGOActionTile(m_selectedTile)
				
				// Picked action
				if (selectedAction) {
					
					// Apply and execute the action
					selectedAction.appliedTile = tile;
					var actions = m_executor.executeAction(selectedAction);
					
					clearSelectedGOActions();
					
					if (actions && actions.length > 0)
						selectGOActions(actions);
					
				} else {
					
					clearSelectedGOActions();
					
					var availableGOActions = m_executor.getAvailableActions(m_selectedTile);
					
					if (availableGOActions.length > 0) {
						// DEBUG: Select the first unit actions only
						selectGOActions(availableGOActions[0].actions);
					}
				}
			
			m_selectedTile.select();
			
		} else {
			// Unselect any action tiles
			clearSelectedGOActions();
		}	
	}
	
	
	var onTileClicked = function(event, tile) {
		selectTile(tile);
	}
	
	
	
	
	
	//
	// Action selection helpers
	//
	var isGOSelected = function () {
		return !!m_selectedGOActions;
	}
	
	var selectGOActions = function (actions) {
		m_selectedGOActions = actions;
		
		iterateOverActionTiles(m_selectedGOActions, function (tile) {
    			tile.select();
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
	    	iterateOverActionTiles(m_selectedGOActions, function (tile) {
	    			tile.unSelect();
	    		});
	    	
	    	m_selectedGOActions = null;
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
	
	
	//
	// Initialize
	//
	m_worldRendererSB.subscribe(GameWorldRenderer.Events.TILE_CLICKED, onTileClicked);
}
