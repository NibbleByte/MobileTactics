//===============================================
// RenderEvents
//
// Contains render events.
//===============================================
"use strict";

// Supported render events that user can subscribe to.
var RenderEvents = {
		Animations: {
			ANIMATION_BEFORE_FRAME: "render.animations.animation_before_frame",	// Arguments: event
			ANIMATION_PROGRESSED: "render.animations.animation_progressed",		// Arguments: event, {name, animator, entity}
			ANIMATION_FINISHED: "render.animations.animation_finished",			// Arguments: event, {name, animator, entity}
			ANIMATION_AFTER_FRAME: "render.animations.animation_after_frame",	// Arguments: event
		}
}