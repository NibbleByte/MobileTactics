//===============================================
// RenderEvents
//
// Contains render events.
//===============================================
"use strict";

// Supported render events that user can subscribe to.
var RenderEvents = {
		Sprites: {
			SPRITE_CREATED: "render.sprites.sprite_created",					// Arguments: event, sprite
			SPRITES_REMOVED: "render.sprites.sprites_removed",					// Arguments: event, [sprites]
		},
		
		Layers: {
			REFRESH_LAYER: "render.layers.refresh_layer",						// Arguments: event, layer (enum)
			REFRESH_ALL: "render.layers.refresh_all",							// Arguments: event
		},

		Animations: {
			ANIMATION_BEFORE_FRAME: "render.animations.animation_before_frame",	// Arguments: event
			ANIMATION_PROGRESSED: "render.animations.animation_progressed",		// Arguments: event, {name, animator, entity}
			ANIMATION_FINISHED: "render.animations.animation_finished",			// Arguments: event, {name, animator, entity}
			ANIMATION_AFTER_FRAME: "render.animations.animation_after_frame",	// Arguments: event
		}
}