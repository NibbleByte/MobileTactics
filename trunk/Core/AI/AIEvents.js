//===============================================
// AIEvents
//
// Contains AI events.
//===============================================
"use strict";

var AIEvents = {

	Simulation: {
		FORCE_START_SIMULATION:	"ai.simulation.force_start_simulation",	// event
		START_SIMULATION:		"ai.simulation.start_simulation",		// event
		GATHER_ASSIGNMENTS:		"ai.simulation.gather_assignments",		// event, [tasks], [assignments]
		SIMULATION_FINISHED:	"ai.simulation.simulation_finished",	// event, [tasks], [assignments]
		RESUME_SIMULATION:		"ai.simulation.resume_simulation",		// event, [tasks]
	},

	Execution: {
		CURRENT_ASSIGNMENT_CHANGED:	"ai.execution.current_assignment_changed",	// event, assignment
	},
}

var AIBlackBoard = {
	
	Simulation: {
		RESUME_NEEDED:	"ai.simulation.resume_needed",
	},
};