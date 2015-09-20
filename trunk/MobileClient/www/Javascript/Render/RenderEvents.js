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
			REFRESH_SPRITES: "render.sprites.refresh_sprites",					// Arguments: event, [sprites]/sprite
		},
		
		Layers: {
			REFRESH_LAYER: "render.layers.refresh_layer",						// Arguments: event, layer (enum)
			REFRESH_ALL: "render.layers.refresh_all",							// Arguments: event
			SORT_DEPTH: "render.layers.sort_depth",								// Arguments: event, layer (enum)/sprite
			SORT_DEPTH_ALL: "render.layers.sort_depth_all",						// Arguments: event
			SORT_DEPTH_REFRESH: "render.layers.sort_depth_refresh",				// Arguments: event, layer (enum)/sprite
		},

		Animations: {
			ANIMATION_BEFORE_FRAME: "render.animations.animation_before_frame",	// Arguments: event
			ANIMATION_FINISHED: "render.animations.animation_finished",			// Arguments: event, {name, animator, entity}
			ANIMATION_AFTER_FRAME: "render.animations.animation_after_frame",	// Arguments: event, [animators], ticker
		},

		OverlayEffects: {
			FLOAT_TEXT_TILE: "render.overlay_effects.float_text_tile",			// Arguments: event, tile, text, params
			CLEAR_TEXTS: "render.overlay_effects.clear_texts",					// Arguments: event
			
		},

		IdleAnimations: {
			START_IDLE_ANIMATION_STRUCTURE: "render.IdleAnimations.start_idle_animations_structure",	// Arguments: tile
			START_IDLE_ANIMATION_UNIT:		"render.IdleAnimations.start_idle_animations_unit",			// Arguments: unit
		},

		Debug: {
			TILE_DRAW_TEXT: "render.debug.tile_draw_text",						// Arguments: event, tile, text, opt_backgroundImage
			CLEAR_TILES: "render.debug.clear_tiles",							// Arguments: event
			
		},
}

// Generic enum for intents.
var RenderIntents = {
	None: '',
	Positive: 'positive',
	Neutral: 'neutral',
	Negative: 'negative',
}