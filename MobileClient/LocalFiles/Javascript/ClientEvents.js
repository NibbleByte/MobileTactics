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
			ACTIONS_CLEARED: "client.controller.actions_cleared",	// Arguments: event		
			ACTIONS_OFFERED: "client.controller.actions_offered",	// Arguments: event, actions		
			
		}
}