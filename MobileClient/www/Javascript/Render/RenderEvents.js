//===============================================
// RenderEvents
//
// Contains render events.
//===============================================
"use strict";

// Supported render events that user can subscribe to.
var RenderEvents = {
		Sprites: {
			SPRITE_CREATED: "render.sprites.sprite_created",					// Arguments: sprite
			SPRITES_REMOVED: "render.sprites.sprites_removed",					// Arguments: [sprites]
			REFRESH_SPRITES: "render.sprites.refresh_sprites",					// Arguments: [sprites]/sprite
		},
		
		Layers: {
			REFRESH_LAYER: "render.layers.refresh_layer",						// Arguments: layer (enum)
			REFRESH_ALL: "render.layers.refresh_all",							// Arguments: 
			SORT_DEPTH: "render.layers.sort_depth",								// Arguments: layer (enum)/sprite
			SORT_DEPTH_ALL: "render.layers.sort_depth_all",						// Arguments: 
			SORT_DEPTH_REFRESH: "render.layers.sort_depth_refresh",				// Arguments: layer (enum)/sprite
		},

		Fog: {
			REFRESH_FOG: "render.fog.refresh_fog",								// Arguments: 
		},

		Animations: {
			ANIMATION_BEFORE_FRAME: "render.animations.animation_before_frame",	// Arguments: 
			ANIMATION_FINISHED: "render.animations.animation_finished",			// Arguments: {name, animator, entity}
			ANIMATION_AFTER_FRAME: "render.animations.animation_after_frame",	// Arguments: [animators], ticker
		},

		OverlayEffects: {
			FLOAT_TEXT_TILE: "render.overlay_effects.float_text_tile",			// Arguments: tile, text, params
			CLEAR_TEXTS: "render.overlay_effects.clear_texts",					// Arguments: 
			
		},

		IdleAnimations: {
			START_IDLE_ANIMATION_STRUCTURE: "render.IdleAnimations.start_idle_animations_structure",	// Arguments: tile
			START_IDLE_ANIMATION_UNIT:		"render.IdleAnimations.start_idle_animations_unit",			// Arguments: unit
		},

		FightAnimations: {
			FIGHT_STARTED: "render.FightAnimations.fight_started",				// Arguments: 
			FIGHT_FINISHED: "render.FightAnimations.fight_finished",			// Arguments: 
		},

		Debug: {
			TILE_DRAW_TEXT: "render.debug.tile_draw_text",						// Arguments: tile, text, opt_backgroundImage
			CLEAR_TILES: "render.debug.clear_tiles",							// Arguments: 
			
		},
}

// Generic enum for intents.
var RenderIntents = {
	None: '',
	Positive: 'positive',
	Neutral: 'neutral',
	Negative: 'negative',
}

var PlayerColors = [
	60,
	120,
	175,
	220,
	30,
	200,
	300,
];