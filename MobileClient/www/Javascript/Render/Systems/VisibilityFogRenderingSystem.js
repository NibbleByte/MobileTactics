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
	var applyVisibilityFog = function (tile) {
		TileRenderingSystem.setTileVisibilityFog(tile, !tile.CTileVisibility.visible);
	}
	
	var refreshFog = function () {
		m_world.iterateAllTiles(applyVisibilityFog);
	}

	var refreshFogAfter = function () {
		self._eworld.trigger(RenderEvents.Layers.REFRESH_ALL);
	}
}

ECS.EntityManager.registerSystem('VisibilityFogRenderingSystem', VisibilityFogRenderingSystem);
SystemsUtils.supplySubscriber(VisibilityFogRenderingSystem);