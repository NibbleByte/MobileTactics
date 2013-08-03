//===============================================
// TilePlaceableRenderingSystem
// Renders a GameWorld onto a specified div.
//===============================================
"use strict";

var TilePlaceableRenderingSystem = function (world, renderer) {
	var self = this;
	
	console.assert(world instanceof GameWorld, "GameWorld is required.");
	console.assert(renderer instanceof GameWorldRenderer, "GameWorldRenderer is required.");
		
	//
	// Entity system initialize
	//
	this.onAdded = function () {
		m_eworld = this.getEntityWorld();
		m_eworldSB = m_eworld.createSubscriber();
		
		m_eworldSB.subscribe(GameWorld.Events.PLACEABLE_REGISTERED, onPlaceableRegistered);
		m_eworldSB.subscribe(GameWorld.Events.PLACEABLE_MOVED, onPlaceableMoved);
		m_eworldSB.subscribe(GameWorld.Events.PLACEABLE_UNREGISTERED, onPlaceableUnregistered);
	}
	
	this.onRemoved = function () {
		m_eworldSB.unsubscribeAll();
		m_eworldSB = null;
		m_eworld = null;
	}
	
	//
	// Fields
	//
	var m_world = world;
	var m_eworld = null;
	var m_eworldSB = null;
	
	var m_renderer = renderer;
	
	var onPlaceableRegistered = function(event, placeable) {		
		// Placeable
		m_renderer.worldLayers.attachTo(WorldLayers.LayerTypes.Units, placeable.CTilePlaceableRendering.$renderedPlaceable);
		placeable.CTilePlaceableRendering.refreshSkin();
		
		// Unit
		m_renderer.worldLayers.attachTo(WorldLayers.LayerTypes.Units, placeable.CUnitRendering.$renderedHolder);
	}
	
	var onPlaceableMoved = function(event, placeable) {
		var coords = placeable.CTilePlaceable.tile.CTileRendering.getRenderedCenterXY();
		
		placeable.CTilePlaceableRendering.renderAt(coords.x, coords.y);
		placeable.CUnitRendering.renderAt(coords.x, coords.y);
	}
	
	var onPlaceableUnregistered = function(event, placeable) {
		m_renderer.worldLayers.detach(placeable.CUnitRendering.$renderedHolder);
		placeable.CTilePlaceableRendering.clear();
		
	}
}

ECS.EntityManager.registerSystem('TilePlaceableRenderingSystem', TilePlaceableRenderingSystem);