//===============================================
// EngineEvents
//
// Contains base engine events.
//===============================================
"use strict";

// Supported GameWorld events that user can subscribe to.
var EngineEvents = {
		General: {
			GAME_LOADING:	"engine.general.game_loading",	// event
			GAME_LOADED:	"engine.general.game_loaded",	// event
		},
		
		World: {
			TILE_ADDED: 	"engine.world.tile_added",		// event, addedTile
			TILE_CHANGED: 	"engine.world.tile_changed",	// event, changedTile
			TILE_REMOVING: 	"engine.world.tile_removing",	// event, removedTile
			TILE_REMOVED: 	"engine.world.tile_removed",	// event
		},

		Placeables: {
			PLACEABLE_REGISTERED: 		"engine.world.placeable_registered",	// event, placeable
			PLACEABLE_MOVING: 			"engine.world.placeable_moving",		// event, placeable
			PLACEABLE_MOVED: 			"engine.world.placeable_moved",			// event, placeable
			PLACEABLE_UNREGISTERING: 	"engine.world.placeable_unregistering",	// event, placeable		
			PLACEABLE_UNREGISTERED: 	"engine.world.placeable_unregistered",	// event		
		},
		
		Serialization: {
			ENTITY_DESERIALIZED:	"engine.serialization.deserialized",	// event, entity
		}
}