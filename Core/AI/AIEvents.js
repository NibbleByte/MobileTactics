//===============================================
// AIEvents
//
// Contains AI events.
//===============================================
"use strict";

var AIEvents = {

	Simulation: {
		START_SIMULATION:		"ai.simulation.start_simulation",		// event
		GATHER_ASSIGNMENTS:		"ai.simulation.gather_assignments",		// event, [assignments]
		SIMULATION_FINISHED:	"ai.simulation.simulation_finished",	// event, [assignments]
	},

	Execution: {
		CURRENT_ASSIGNMENT_CHANGED:	"ai.execution.current_assignment_changed",	// event, assignment
	},
}