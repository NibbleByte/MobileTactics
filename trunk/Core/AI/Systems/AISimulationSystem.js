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
		self._eworldSB.subscribe(AIEvents.Simulation.START_SIMULATION, doSimulation);
		self._eworldSB.subscribe(AIEvents.Simulation.RESUME_SIMULATION, doSimulation);
	}


	//
	// Private
	//

	var doSimulation = function (tasks) {

		tasks = tasks || [];
		var assignments = [];
		self._eworld.trigger(AIEvents.Simulation.GATHER_ASSIGNMENTS, tasks, assignments);

		assignments.sort(assignmentSorting);

		self._eworld.blackboard[AIBlackBoard.Simulation.RESUME_NEEDED] = false;

		self._eworld.triggerAsync(AIEvents.Simulation.SIMULATION_FINISHED, tasks, assignments);
	}

	// Descending
	var assignmentSorting = function (assignmentA, assignmentB) {
		return assignmentB.priority - assignmentA.priority;
	}
}

ECS.EntityManager.registerSystem('AISimulationSystem', AISimulationSystem);
SystemsUtils.supplySubscriber(AISimulationSystem);