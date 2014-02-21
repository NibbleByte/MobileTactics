//===============================================
// VisibilityFogRenderingSystem
// Deals with the visibility fog.
//===============================================
"use strict";

var VisibilityFogRenderingSystem = function (m_world) {
	var self = this;
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(GameplayEvents.Fog.REFRESH_FOG, refreshFog);
	}
	
	//
	// Private
	//
	var applyVisibilityFog = function (tile) {
		if (tile.CTileVisibility.visible) {
			tile.CTileRendering.hideVisibilityFog();
		} else {
			tile.CTileRendering.showVisibilityFog();
		}
	}
	
	var refreshFog = function (event, currentPlayer) {
		m_world.iterateAllTiles(applyVisibilityFog);
	}
}

ECS.EntityManager.registerSystem('VisibilityFogRenderingSystem', VisibilityFogRenderingSystem);
SystemsUtils.supplySubscriber(VisibilityFogRenderingSystem);