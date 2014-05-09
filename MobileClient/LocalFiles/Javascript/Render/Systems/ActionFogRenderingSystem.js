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
	}
	
	//
	// Private
	//	
	var onActionsOffered = function (event, actions) {
		
		hideAll();
		
		m_offeredActions = actions;
		
		
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

		self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.ActionFog);
	}
	
	var onActionsCleared = function (event) {
		hideAll();
		self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.ActionFog);
	}

	var hideAll = function () {
		if (m_offeredActions != null) {
			m_offeredActions = null;
			
			m_world.iterateAllTiles(function (tile) {
				// When clearing, while removing tile, component might be missing.
				if (tile.CTileRendering) {
					tile.CTileRendering.hideActionFog();
				}
			});
		}
	}
}

ECS.EntityManager.registerSystem('ActionFogRenderingSystem', ActionFogRenderingSystem);
SystemsUtils.supplySubscriber(ActionFogRenderingSystem);