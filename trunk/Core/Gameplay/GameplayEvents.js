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
			UNIT_DESTROYED: 	"gameplay.units.unit_destroyed",	// event, unit
		},
		
		Players: {
			PLAYER_ADDED: 			"gameplay.players.player_added",	// event, player
			PLAYER_STOPPED_PLAYING: "gameplay.players.player_stopped",	// event, player
			PLAYER_REMOVED: 		"gameplay.players.player_removed",	// event, player
			PLAYERS_CLEARED: 		"gameplay.players.player_cleared",	// event
		},
		
		GameState: {
			END_TURN: 			"gameplay.game_state.end_turn",			// event
			TURN_CHANGED: 		"gameplay.game_state.turn_changed",		// event, player
			NO_PLAYING_PLAYERS: "gameplay.game_state.no_playingplayers",// event, player
		},

		Fog: {
			REFRESH_FOG:		"gameplay.fog.refresh_fog"				// event
		},
}