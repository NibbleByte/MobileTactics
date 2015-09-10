//===============================================
// FightRenderingEvents
//
// Contains fight rendering events.
//===============================================
"use strict";

// Supported render events that user can subscribe to.
var FightRenderingEvents = {
		Fight: {
			INITIALIZE:		"ft.fight.initialize",				// Arguments: 
			SHOW_UP_FINISH:	"ft.fight.show_up_finish",			// Arguments: 
			ATTACK:			"ft.fight.attack",					// Arguments: unit
			ATTACK_FINISH:	"ft.fight.attack_finish",			// Arguments: 
			END_TAUNT:		"ft.fight.end_taunt",				// Arguments: unit
			IDLE:			"ft.fight.idle",					// Arguments: 
			UNINITIALIZE:	"ft.fight.uninitialize",			// Arguments: 
		},

		Animations: {
			FIRE:			"ft.animations.fire",				// Arguments: animData, {weaponType, final},
			HURT:			"ft.animations.hurt",				// Arguments: unit, {weaponType, final},
			HURT_FINISH:	"ft.animations.hurt_finish",		// Arguments: unit
		},

		Units: {
			UNIT_MOVED: "ft.units.moved",						// Arguments: fightUnit
			UNIT_KILLED: "ft.units.unit_killed",				// Arguments: fightUnit
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