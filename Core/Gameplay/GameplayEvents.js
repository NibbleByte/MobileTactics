//===============================================
// GameplayEvents
//
// Contains gameplay events.
//===============================================
"use strict";

// Supported GameWorld events that user can subscribe to.
var GameplayEvents = {
		Units: {
			UNIT_CHANGED: 				"gameplay.units.unit_changed",				// unit
			UNIT_TURN_POINTS_CHANGED:	"gameplay.units.unit_turn_points_changed",	// unit
			DESTROY_UNIT: 				"gameplay.units.destroy_unit",				// unit
			UNIT_DESTROYING: 			"gameplay.units.unit_destroying",			// unit
			UNIT_DESTROYED: 			"gameplay.units.unit_destroyed",			// unit
			UNIT_DESTROYING_UNDO: 		"gameplay.units.unit_destroying_undo",		// unit
		},

		Structures: {
			CAPTURE_STARTED: 		"gameplay.structures.capture_started",		// tile
			CAPTURE_STOPPED: 		"gameplay.structures.capture_stopped",		// tile
			CAPTURE_INTERUPTED: 	"gameplay.structures.capture_interupted",	// tile
			CAPTURE_FINISHED:		"gameplay.structures.capture_finished",		// tile
			OWNER_CHANGED:			"gameplay.structures.owner_changed",		// tile
		},
		
		Players: {
			PLAYER_ADDED: 			"gameplay.players.player_added",		// player
			IS_PLAYING_CHANGED:		"gameplay.players.is_playing_changed",	// player
			PLAYER_REMOVED: 		"gameplay.players.player_removed",		// player
			PLAYERS_CLEARED: 		"gameplay.players.player_cleared",		// 
		},
		
		GameState: {
			START_GAME: 		"gameplay.game_state.start_game",		// 
			END_TURN: 			"gameplay.game_state.end_turn",			// 
			TURN_CHANGING: 		"gameplay.game_state.turn_changing",	// gameState, hasJustLoaded
			VIEWER_CHANGED: 	"gameplay.game_state.viewer_changed",	// gameState, hasJustLoaded
			TURN_CHANGED: 		"gameplay.game_state.turn_changed",		// gameState, hasJustLoaded
			NO_PLAYING_PLAYERS: "gameplay.game_state.no_playingplayers",// player
		},

		Actions: {
			ATTACK: 			"gameplay.actions.attack",				// outcome
			HEAL: 				"gameplay.actions.heal",				// unit, amount
		},

		Resources: {
			CURRENT_CREDITS_CHANGED: "gameplay.resources.current_credits_changed",	// value, delta
			ADD_CREDITS: 			 "gameplay.resources.add_credits",				// player, delta
		},

		Store: {
			PLACEABLE_BOUGHT:	"gameplay.store.placeable_bought",		// placeable
		},

		Visibility: {
			FORCE_VISIBILITY_REFRESH:	"gameplay.Visibility.force_visibility_refresh",		// 

			REFRESH_VISIBILITY:			"gameplay.visibility.refresh_visibility",			// 
			REFRESH_VISIBILITY_AFTER:	"gameplay.Visibility.refresh_visibility_after",		// 
		},
}

var GameplayBlackBoard = {

	Actions: {
		CURRENT_ACTION:		"gameplay.actions.current_action",
	},
};