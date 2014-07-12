//===============================================
// GameplayEvents
//
// Contains gameplay events.
//===============================================
"use strict";

// Supported GameWorld events that user can subscribe to.
var GameplayEvents = {
		Units: {
			UNIT_CHANGED: 		"gameplay.units.unit_changed",		// event, unit
			DESTROY_UNIT: 		"gameplay.units.destroy_unit",		// event, unit
			UNIT_DESTROYING: 	"gameplay.units.unit_destroying",	// event, unit
		},

		Structures: {
			CAPTURE_STARTED: 		"gameplay.structures.capture_started",		// event, tile
			CAPTURE_INTERUPTED: 	"gameplay.structures.capture_interupted",	// event, tile
			CAPTURE_FINISHED:		"gameplay.structures.capture_finished",		// event, tile
		},
		
		Players: {
			PLAYER_ADDED: 			"gameplay.players.player_added",	// event, player
			PLAYER_STOPPED_PLAYING: "gameplay.players.player_stopped",	// event, player
			PLAYER_REMOVED: 		"gameplay.players.player_removed",	// event, player
			PLAYERS_CLEARED: 		"gameplay.players.player_cleared",	// event
		},
		
		GameState: {
			END_TURN: 			"gameplay.game_state.end_turn",			// event
			TURN_CHANGING: 		"gameplay.game_state.turn_changing",	// event, gameState
			TURN_CHANGED: 		"gameplay.game_state.turn_changed",		// event, gameState, hasJustLoaded
			NO_PLAYING_PLAYERS: "gameplay.game_state.no_playingplayers",// event, player
		},

		Fog: {
			REFRESH_FOG:		"gameplay.fog.refresh_fog",				// event
			REFRESH_FOG_AFTER:	"gameplay.fog.refresh_fog_after",		// event
		},
}