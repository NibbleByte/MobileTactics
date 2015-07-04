//===============================================
// FightRenderingEvents
//
// Contains fight rendering events.
//===============================================
"use strict";

// Supported render events that user can subscribe to.
var FightRenderingEvents = {
		Fight: {
			INITIALIZE: "ft.fight.initialize",					// Arguments: event
			SHOW_UP:	"ft.fight.show_up",						// Arguments: event
			IDLE:		"ft.fight.idle",						// Arguments: event
			UNINITIALIZE: "ft.fight.uninitialize",				// Arguments: event
		},

		Units: {
			UNIT_MOVED: "ft.units.moved",						// Arguments: event, fightUnit
			UNIT_KILLED: "ft.units.unit_killed",				// Arguments: event, fightUnit
		},
};

var FightRenderingBlackBoard = {
	Battle: {
		// Don't you dare cache these objects in your system!
		OUTCOME:		"battlerendering.battle.outcome",
		LEFT_UNIT:		"battlerendering.battle.left_unit",
		RIGHT_UNIT:		"battlerendering.battle.right_unit",
		LEFT_FIGHTER:		"battlerendering.battle.left_fighter",
		RIGHT_FIGHTER:		"battlerendering.battle.right_fighter",
	},
};