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

	var onSimulationStart = function (event) {

		var assignments = [];
		self._eworld.trigger(AIEvents.Simulation.GATHER_ASSIGNMENTS, assignments);

		assignments.sort(assignmentSorting);

		var validAssignments = [];
		for(var i = 0; i < assignments.length; ++i) {
			var assignment = assignments[i];

			if (assignment.canAssign()) {
				assignment.assign();

				validAssignments.push(assignment);
			}
		}

		self._eworld.trigger(AIEvents.Simulation.SIMULATION_FINISHED, validAssignments);
	}

	// Descending
	var assignmentSorting = function (assignmentA, assignmentB) {
		return assignmentB.score - assignmentA.score;
	}
}

ECS.EntityManager.registerSystem('AISimulationSystem', AISimulationSystem);
SystemsUtils.supplySubscriber(AISimulationSystem);