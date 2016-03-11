//===============================================
// EngineEvents
//
// Contains base engine events.
//===============================================
"use strict";

// Supported GameWorld events that user can subscribe to.
var EngineEvents = {
		General: {
			// Use GAME_LOADING to cache the NEW game state (including on re-loading world).
			// GAME_LOADED is after all loading is done.
			GAME_LOADING:			"engine.general.game_loading",				// 
			GAME_VALIDATE:			"engine.general.game_validate",				// failReasons
			GAME_VALIDATION_FAILED:	"engine.general.game_validation_failed",	// failReasons
			GAME_LOADED:			"engine.general.game_loaded",				// 
		},
		
		World: {
			TILE_ADDED: 	"engine.world.tile_added",		// addedTile
			TILE_CHANGED: 	"engine.world.tile_changed",	// changedTile
			TILE_REMOVING: 	"engine.world.tile_removing",	// removedTile
			TILE_REMOVED: 	"engine.world.tile_removed",	// 
			WORLD_CLEARED: 	"engine.world.world_cleared",	// 
		},

		Placeables: {
			PLACEABLE_REGISTERED: 		"engine.world.placeable_registered",	// placeable
			PLACEABLE_MOVING: 			"engine.world.placeable_moving",		// placeable
			PLACEABLE_MOVED: 			"engine.world.placeable_moved",			// placeable
			PLACEABLE_UNREGISTERING: 	"engine.world.placeable_unregistering",	// placeable		
			PLACEABLE_UNREGISTERED: 	"engine.world.placeable_unregistered",	// 
		},
		
		Serialization: {
			ENTITY_DESERIALIZED:	"engine.serialization.deserialized",	// entity
		},

		Utils: {
			INVALIDATE:		"engine.utils.invalidate"	// object
		},
}

var EngineBlackBoard = {

	World: {
		IS_CLEARING_WORLD: "engine.world.is_clearing_world",
	},

	Serialization: {
		IS_LOADING:		"engine.serialization.is_loading",
	},
};