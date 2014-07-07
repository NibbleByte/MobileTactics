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

		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, onTurnChanged);
		
		self._eworldSB.subscribe(GameplayEvents.Units.UNIT_CHANGED, onUnitChanged);
		self._eworldSB.subscribe(GameplayEvents.Units.DESTROY_UNIT, onDestroyUnit);
	}
	
	var onPlaceableRegistered = function(event, placeable) {				
		
		if (!placeable.hasComponents(CUnit))
			return;
		
		placeable.CUnit.health = placeable.CStatistics.statistics['MaxHealth'];
	}

	var onTurnChanged = function (event, gameState, hasJustLoaded) {

		if (hasJustLoaded)
			return;
		
		for(var i = 0; i < gameState.currentPlaceables.length; ++i) {
			var placeable = gameState.currentPlaceables[i];

			placeable.CUnit.turnPoints = placeable.CStatistics.statistics['TurnPoints'] || 1;
			placeable.CUnit.finishedTurn = false;
		}
	}
		
	var onUnitChanged = function(event, unit) {
		
		// Check if dead.
		if (unit.CUnit.health <= 0) {
			// Don't allow others to receive onChange event if unit is about to be destroyed.
			// Ensure I'm the first in the event chain.
			event.stopImmediatePropagation();
			self._eworld.trigger(GameplayEvents.Units.DESTROY_UNIT, unit);
		}
	}	

	var onDestroyUnit = function(event, unit) {
		self._eworld.trigger(GameplayEvents.Units.UNIT_DESTROYING, unit);
		unit.destroy();
	}
};

ECS.EntityManager.registerSystem('UnitsSystem', UnitsSystem);
SystemsUtils.supplySubscriber(UnitsSystem);