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
	this.initialize = function () {
		self._eworldSB.subscribe(EngineEvents.Placeables.PLACEABLE_REGISTERED, onPlaceableRegistered);
		
		self._eworldSB.subscribe(GameplayEvents.Units.UNIT_CHANGED, onUnitChanged);
	}
	
	var onPlaceableRegistered = function(event, placeable) {				
		
		if (!placeable.hasComponents(CUnit))
			return;
		
		placeable.CUnit.health = placeable.CStatistics.statistics['MaxHealth'];
	}
		
	var onUnitChanged = function(event, unit) {
		
		// Check if dead.
		if (unit.CUnit.health <= 0) {
			self._eworld.trigger(GameplayEvents.Units.UNIT_DESTROYED, unit);
			unit.destroy();
			
			// Prevent others using the destroyed unit.
			event.stopImmediatePropagation();
		}
	}
};

ECS.EntityManager.registerSystem('UnitsSystem', UnitsSystem);
SystemsUtils.supplySubscriber(UnitsSystem);