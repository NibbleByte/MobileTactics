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

	var onSimulationStart = function (event) {
		setTimeout(function () {
			self._eworld.trigger(AIEvents.Simulation.SIMULATION_FINISHED);
		}, 2000);
	}

}

ECS.EntityManager.registerSystem('AISimulationSystem', AISimulationSystem);
SystemsUtils.supplySubscriber(AISimulationSystem);