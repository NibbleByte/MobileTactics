//===============================================
// AISimulationSystem
// The ai simulation.
//===============================================
"use strict";

var AISimulationSystem = function (m_eworld) {
	var self = this;
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(AIEvents.Simulation.START_SIMULATION, onSimulationStart);
	}


	//
	// Private
	//

	var onSimulationStart = function () {

		var assignments = [];
		self._eworld.trigger(AIEvents.Simulation.GATHER_ASSIGNMENTS, assignments);

		assignments.sort(assignmentSorting);

		self._eworld.triggerAsync(AIEvents.Simulation.SIMULATION_FINISHED, assignments);
	}

	// Descending
	var assignmentSorting = function (assignmentA, assignmentB) {
		return assignmentB.priority - assignmentA.priority;
	}
}

ECS.EntityManager.registerSystem('AISimulationSystem', AISimulationSystem);
SystemsUtils.supplySubscriber(AISimulationSystem);