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

		self._eworldSB.subscribe(GameplayEvents.Structures.CAPTURE_STARTED, onCaptureStarted);

		self._eworldSB.subscribe(GameplayEvents.Store.PLACEABLE_BOUGHT, onActionsCleared);

		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGING, onTurnChanging);
	}
	
	//
	// Private
	//	
	var onActionsOffered = function (goActions) {
		
		hideAll();
		
		m_offeredActions = goActions.actions;
		
		
		var moveAction = goActions.getActionByType(Actions.Classes.ActionMove);
		var attackAction = goActions.getActionByType(Actions.Classes.ActionAttack);
		
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
	
	var onActionsCleared = function () {

		hideAll();
		self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.Highlights);
		self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.ActionFog);
	}

	var onCaptureStarted = function (tile) {
		
		if (Utils.assert(tile.CTile.placedObjects.length > 0))
			return;

		tile.CTile.placedObjects[0].CUnitRendering.showFinished(true);
		
		self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.Highlights);
		self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.ActionFog);
	}

	var onTurnChanging = function () {

		var placeables = self._eworld.getSystem(GameWorld).getPlaceables();

		// If about to change turn, remove finished fogs over previous player units.
		for (var i = 0; i < placeables.length; ++i) {
			var placeable = placeables[i];
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