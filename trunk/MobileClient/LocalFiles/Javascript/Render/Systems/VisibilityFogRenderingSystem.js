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
		self._eworldSB.subscribe(GameplayEvents.Fog.REFRESH_FOG_AFTER, refreshFogAfter);
	}
	
	//
	// Private
	//
	// TODO: Use canvas for this?
	var applyVisibilityFog = function (tile) {
		if (tile.CTileVisibility.visible) {
			tile.CTileRendering.hideVisibilityFog();
		} else {
			tile.CTileRendering.showVisibilityFog();
		}
	}
	
	var refreshFog = function (event) {
		m_world.iterateAllTiles(applyVisibilityFog);
	}

	var refreshFogAfter = function (event) {
		self._eworld.trigger(RenderEvents.Layers.REFRESH_ALL);
	}
}

ECS.EntityManager.registerSystem('VisibilityFogRenderingSystem', VisibilityFogRenderingSystem);
SystemsUtils.supplySubscriber(VisibilityFogRenderingSystem);