//===============================================
// ActionFogRenderingSystem
// Deals with the action fog.
//===============================================
"use strict";

var ActionFogRenderingSystem = function (m_world) {
	var self = this;
	
	var m_offeredActions = null;
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(ClientEvents.Controller.ACTIONS_OFFERED, onActionsOffered);
		self._eworldSB.subscribe(ClientEvents.Controller.ACTIONS_CLEARED, onActionsCleared);
		self._eworldSB.subscribe(ClientEvents.Controller.ACTION_CANCEL, onActionsCleared);

		self._eworldSB.subscribe(GameplayEvents.Store.PLACEABLE_BOUGHT, onActionsCleared);

		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGING, onTurnChanging);
	}
	
	//
	// Private
	//	
	var onActionsOffered = function (event, goActions) {
		
		hideAll();
		
		m_offeredActions = goActions.actions;
		
		
		var moveAction = null;
		var attackAction = null;
		for (var i = 0; i < m_offeredActions.length; ++i) {
			if (m_offeredActions[i].actionType == Actions.Classes.ActionMove) {
				moveAction = m_offeredActions[i];
			}
			
			if (m_offeredActions[i].actionType == Actions.Classes.ActionAttack) {
				attackAction = m_offeredActions[i];
			}
		}
		
		
		// No special action available, refresh with no fog.
		if (moveAction == null && attackAction == null) {
			self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.Highlights);
			self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.ActionFog);
			return;
		}
		
		var placeableTile = 
			(moveAction != null) 
			? moveAction.placeable.CTilePlaceable.tile
			: attackAction.placeable.CTilePlaceable.tile; 
		
		m_world.iterateAllTiles(function (tile) {
			
			if ((moveAction != null && moveAction.availableTiles.indexOf(tile) != -1)
				|| (attackAction != null && attackAction.availableTiles.indexOf(tile) != -1)
				|| tile == placeableTile
				) {
				tile.CTileRendering.hideActionFog();
			} else {
				tile.CTileRendering.showActionFog();
			}
		});

		self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.Highlights);
		self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.ActionFog);
	}
	
	var onActionsCleared = function (event) {

		hideAll();
		self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.Highlights);
		self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.ActionFog);
	}

	var onTurnChanging = function (event) {

		var gameState = self._eworld.extract(GameState);

		// If about to change turn, remove finished fogs over previous player units.
		for (var i = 0; i < gameState.currentPlaceables.length; ++i) {
			var placeable = gameState.currentPlaceables[i];
			placeable.CUnitRendering.hideFinished();
		}
	}

	var hideAll = function () {
		m_offeredActions = null;

		var gameState = self._eworld.extract(GameState);

		m_world.iterateAllTiles(function (tile) {
			// When clearing, while removing tile, component might be missing.
			if (tile.CTileRendering) {
				tile.CTileRendering.hideActionFog();
			}
		});

		// If placeable finished turn, do show fog.
		for(var i = 0; i < gameState.currentPlaceables.length; ++i) {
			var placeable = gameState.currentPlaceables[i];
			placeable.CUnitRendering.showFinished(placeable.CUnit.finishedTurn);
		}
	}
}

ECS.EntityManager.registerSystem('ActionFogRenderingSystem', ActionFogRenderingSystem);
SystemsUtils.supplySubscriber(ActionFogRenderingSystem);