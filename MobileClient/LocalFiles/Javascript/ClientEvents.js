//===============================================
// ClientEvents
//
// Contains client events.
//===============================================
"use strict";

// Supported client events that user can subscribe to.
var ClientEvents = {
		Input: {
			TILE_CLICKED: "client.input.tile_clicked",	// Arguments: event, tile
		},
		
		Controller: {
			ACTIONS_CLEARED: "client.controller.actions_cleared",		// Arguments: event
			ACTION_PREEXECUTE: "client.controller.action_preexecute", 	// Arguments: event, action
			ACTIONS_OFFERED: "client.controller.actions_offered",		// Arguments: event, actions
			
		}
}