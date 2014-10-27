//===============================================
// ClientEvents
//
// Contains client events.
//===============================================
"use strict";

// Supported client events that user can subscribe to.
var ClientEvents = {
		Input: {
			TILE_CLICKED:		"client.input.tile_clicked",	// Arguments: event, { tile, row, column } (Reused)
			TILE_TOUCH_DOWN:	"client.input.tile_touch_down",	// Arguments: event, { tile, row, column } (Reused)
			TILE_TOUCH:			"client.input.tile_touch",		// Arguments: event, { tile, row, column } (Reused)
			TILE_TOUCH_UP:		"client.input.tile_touch_up",	// Arguments: event, { tile, row, column } (Reused)
		},
		
		Controller: {
			ACTIONS_CLEARED: "client.controller.actions_cleared",		// Arguments: event
			ACTION_CANCEL: "client.controller.actions_cancel",			// Arguments: event
			ACTION_PREEXECUTE: "client.controller.action_preexecute", 	// Arguments: event, action
			ACTION_EXECUTED: "client.controller.action_executed", 		// Arguments: event, action
			ACTIONS_OFFERED: "client.controller.actions_offered",		// Arguments: event, goActions
			
		}
}