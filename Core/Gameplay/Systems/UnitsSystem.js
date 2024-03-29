//===============================================
// UnitsSystem
// Handles units basic functionality.
//===============================================
"use strict";

var UnitsSystem = function (m_world) {
	var self = this;
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, onTurnChanged);
		
		self._eworldSB.subscribe(GameplayEvents.Units.UNIT_CHANGED, onUnitChanged);
		self._eworldSB.subscribe(GameplayEvents.Units.DESTROY_UNIT, onDestroyUnit);
	}

	var onTurnChanged = function (gameState, hasJustLoaded) {

		if (hasJustLoaded)
			return;

		var placeables = m_world.getPlaceables();
		
		for(var i = 0; i < placeables.length; ++i) {
			var placeable = placeables[i];

			placeable.CUnit.turnPoints = placeable.CStatistics.statistics['TurnPoints'] || 1;
			placeable.CUnit.finishedTurn = false;
			placeable.CUnit.actionsData.clearExecutedActions();
		}
	}
		
	var onUnitChanged = function(unit) {
		
		// Check if dead.
		if (unit.CUnit.health <= 0) {

			self._eworld.trigger(GameplayEvents.Units.DESTROY_UNIT, unit);

			// Don't allow others to receive onChange event if unit is about to be destroyed.
			// Ensure I'm the first in the event chain.
			return { stopPropagation: true };

		} else {

			// Undo support (probably was dead).
			if (unit.getEntityWorld() == null) {
				self._eworld.addUnmanagedEntity(unit);

				self._eworld.trigger(GameplayEvents.Units.UNIT_DESTROYING_UNDO, unit);
			}
		}
	}	

	var onDestroyUnit = function(unit) {
		self._eworld.trigger(GameplayEvents.Units.UNIT_DESTROYING, unit);
		self._eworld.removeManagedEntity(unit);
		self._eworld.trigger(GameplayEvents.Units.UNIT_DESTROYED, unit);
	}
};

ECS.EntityManager.registerSystem('UnitsSystem', UnitsSystem);
SystemsUtils.supplySubscriber(UnitsSystem);