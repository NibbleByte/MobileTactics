//===============================================
// BattleRenderingEvents
//
// Contains battle rendering events.
//===============================================
"use strict";

// Supported render events that user can subscribe to.
var BattleRenderingEvents = {
		Battle: {
			INITIALIZE: "br.battle.initialize",					// Arguments: event
			ATTACK: "br.battle.attack",							// Arguments: event
			DEFEND: "br.battle.defend",							// Arguments: event
			HIT:	"br.battle.hit",							// Arguments: event
			UNINITIALIZE: "br.battle.uninitialize",				// Arguments: event
		},

		Units: {
			UNIT_KILLED: "br.battle.unit_killed",				// Arguments: event, battleUnit
		},

		Render: {
			FIELD_RESIZED: "br.render.field_resized",
		}
};

var BattleRenderingBlackBoard = {
	Battle: {
		ACTIVE:			"battlerendering.battle.active",	// Is currently battle in progress.

		// Don't you dare cache these objects in your system!
		OUTCOME:		"battlerendering.battle.outcome",
		THIS_UNIT:		"battlerendering.battle.this_unit",
		ENEMY_UNIT:		"battlerendering.battle.enemy_unit",
		IS_ATTACKER:	"battlerendering.battle.is_attacker",
	},
};