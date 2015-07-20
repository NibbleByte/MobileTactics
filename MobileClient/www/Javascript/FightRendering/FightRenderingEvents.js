//===============================================
// FightRenderingEvents
//
// Contains fight rendering events.
//===============================================
"use strict";

// Supported render events that user can subscribe to.
var FightRenderingEvents = {
		Fight: {
			INITIALIZE:		"ft.fight.initialize",				// Arguments: event
			SHOW_UP_FINISH:	"ft.fight.show_up_finish",			// Arguments: event
			ATTACK:			"ft.fight.attack",					// Arguments: event, unit
			ATTACK_FINISH:	"ft.fight.attack_finish",			// Arguments: event
			IDLE:			"ft.fight.idle",					// Arguments: event
			UNINITIALIZE:	"ft.fight.uninitialize",			// Arguments: event
		},

		Animations: {
			FIRE:			"ft.animations.fire",				// Arguments: event, animData, {weaponType, final},
			HURT:			"ft.animations.hurt",				// Arguments: event, unit, {weaponType, final},
			HURT_FINISH:	"ft.animations.hurt_finish",		// Arguments: event, unit
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
		LEFT_STATS:		"battlerendering.battle.left_stats",
		RIGHT_STATS:	"battlerendering.battle.right_stats",
		LEFT_FIGHTER:	"battlerendering.battle.left_fighter",
		RIGHT_FIGHTER:	"battlerendering.battle.right_fighter",
	},
};