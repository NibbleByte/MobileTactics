//===============================================
// EngineEvents
//
// Contains base engine events.
//===============================================
"use strict";

// Supported GameWorld events that user can subscribe to.
var EngineEvents = {
		World: {
			TILE_CHANGED: 	"engine.world.tile_changed",	// event, changedTile
			TILE_REMOVED: 	"engine.world.tile_removed",	// event, {row, column}
			SIZE_CHANGED: 	"engine.world.size_changed",	// event, {rows, columns}
		},

		Placeables: {
			PLACEABLE_REGISTERED: 		"engine.world.placeable_registered",	// event, placeable
			PLACEABLE_MOVED: 			"engine.world.placeable_moved",			// event, placeable
			PLACEABLE_UNREGISTERED: 	"engine.world.placeable_unregistered",	// event, placeable		
		}
}