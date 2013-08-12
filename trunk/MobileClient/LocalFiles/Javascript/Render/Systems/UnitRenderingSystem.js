//===============================================
// TilePlaceableRenderingSystem
// Renders a placeable in the world.
//===============================================
"use strict";

var UnitRenderingSystem = function (renderer) {
	var self = this;
	
	console.assert(renderer instanceof GameWorldRenderer, "GameWorldRenderer is required.");
	
	var REQUIRED_COMPONENTS = [CUnitRendering, CTilePlaceableRendering];
		
	//
	// Entity system initialize
	//
	this.onAdded = function () {
		m_eworld = this.getEntityWorld();
		m_eworldSB = m_eworld.createSubscriber();
		
		m_eworldSB.subscribe(EngineEvents.Placeables.PLACEABLE_REGISTERED, onPlaceableRegistered);
		m_eworldSB.subscribe(EngineEvents.Placeables.PLACEABLE_MOVED, onPlaceableMoved);
		m_eworldSB.subscribe(EngineEvents.Placeables.PLACEABLE_UNREGISTERED, onPlaceableUnregistered);
		
		m_eworldSB.subscribe(GameplayEvents.Units.UNIT_CHANGED, onUnitChanged);
	}
	
	this.onRemoved = function () {
		m_eworldSB.unsubscribeAll();
		m_eworldSB = null;
		m_eworld = null;
	}
	
	//
	// Fields
	//
	var m_eworld = null;
	var m_eworldSB = null;
	
	var m_renderer = renderer;
	
	var onPlaceableRegistered = function(event, placeable) {
		
		if (!placeable.hasComponents(REQUIRED_COMPONENTS))
			return;
		
		// Placeable
		m_renderer.worldLayers.attachTo(WorldLayers.LayerTypes.Units, placeable.CTilePlaceableRendering.$renderedPlaceable);
		placeable.CTilePlaceableRendering.refreshSkin();
		
		// Unit
		m_renderer.worldLayers.attachTo(WorldLayers.LayerTypes.Units, placeable.CUnitRendering.$renderedHolder);
		placeable.CUnitRendering.setHealth(placeable.CUnit.health);
	}
	
	var onPlaceableMoved = function(event, placeable) {
		
		if (!placeable.hasComponents(REQUIRED_COMPONENTS))
			return;
		
		var coords = placeable.CTilePlaceable.tile.CTileRendering.getRenderedCenterXY();
		
		placeable.CTilePlaceableRendering.renderAt(coords.x, coords.y);
		placeable.CUnitRendering.renderAt(coords.x, coords.y);
	}
	
	var onPlaceableUnregistered = function(event, placeable) {
		
		if (!placeable.hasComponents(REQUIRED_COMPONENTS))
			return;
		
		m_renderer.worldLayers.detach(placeable.CUnitRendering.$renderedHolder);
		m_renderer.worldLayers.detach(placeable.CTilePlaceableRendering.$renderedPlaceable);		
	}
	
	var onUnitChanged = function(event, unit) {
		unit.CUnitRendering.setHealth(unit.CUnit.health);
	}
}

ECS.EntityManager.registerSystem('UnitRenderingSystem', UnitRenderingSystem);