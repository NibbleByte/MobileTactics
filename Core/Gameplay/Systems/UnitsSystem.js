//===============================================
// UnitsSystem
// Handles units basic functionality.
//===============================================
"use strict";

var UnitsSystem = function () {
	var self = this;
	
	//
	// Entity system initialize
	//
	var m_eworld = null;
	var m_eworldSB = null;
	
	this.onAdded = function () {
		m_eworld = this.getEntityWorld();
		m_eworldSB = m_eworld.createSubscriber();
		
		m_eworldSB.subscribe(EngineEvents.Placeables.PLACEABLE_REGISTERED, onPlaceableRegistered);
		m_eworldSB.subscribe(EngineEvents.Placeables.PLACEABLE_UNREGISTERED, onPlaceableUnregistered);
		
		m_eworldSB.subscribe(GameplayEvents.Units.UNIT_CHANGED, onUnitChanged);
	}
	
	this.onRemoved = function () {
		m_eworldSB.unsubscribeAll();
		m_eworldSB = null;
		m_eworld = null;
	}
	
	
	
	var onPlaceableRegistered = function(event, placeable) {				
		
		if (!placeable.hasComponents(CUnit))
			return;
		
		placeable.CUnit.health = placeable.CStatistics.statistics['MaxHealth'];
	}
	
	var onPlaceableUnregistered = function(event, placeable) {
		
		if (!placeable.hasComponents(CUnit))
			return;
		
		placeable.destroy();
	}
	
	var onUnitChanged = function(event, unit) {
		
		// Check if dead.
		if (unit.CUnit.health <= 0) {
			m_eworld.trigger(GameplayEvents.Units.UNIT_DESTROYED, unit);
			m_eworld.getSystem(GameWorld).unregisterPlaceable(unit);
			
			// Prevent others using the destroyed unit.
			event.stopImmediatePropagation();
		}
	}
};

ECS.EntityManager.registerSystem('UnitsSystem', UnitsSystem);