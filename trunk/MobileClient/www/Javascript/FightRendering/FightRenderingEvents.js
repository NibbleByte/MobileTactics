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
			ATTACK_FINISH:	"ft.fight.attack_finish",			// Arguments: unit
			ATTACKS_FINALIZE:	"ft.fight.attacks_finalize",	// Arguments: 
			END_TAUNT:		"ft.fight.end_taunt",				// Arguments: unit
			IDLE:			"ft.fight.idle",					// Arguments: 
			UNINITIALIZE:	"ft.fight.uninitialize",			// Arguments: 
		},

		Animations: {
			FIRE:			"ft.animations.fire",				// Arguments: animData, {weaponType, final},
			HURT:			"ft.animations.hurt",				// Arguments: unit, {weaponType, final},
			HURT_FINISH:	"ft.animations.hurt_finish",		// Arguments: unit
			DIES:			"ft.animations.dies",				// Arguments: unit
			DIES_HIDE_UNIT:	"ft.animations.dies_hide_unit",		// Arguments: animData
		},

		Layout: {
			REFRESH_UNIT_LAYOUT:"ft.layout.refresh_unit_layout",	// Arguments: unit
			LAYOUT_CHANGED:		"ft.layout.layout_changed",			// Arguments: fightUnit, layoutData
		},

		Units: {
			UNIT_MOVED: "ft.units.moved",						// Arguments: fightUnit
			UNIT_KILLED: "ft.units.unit_killed",				// Arguments: fightUnit
		},
};

var FightRenderingBlackBoard = {
	Battle: {
		// Don't you dare cache these objects in your system!
		OUTCOME:		"fightrendering.battle.outcome",
		LEFT_UNIT:		"fightrendering.battle.left_unit",
		RIGHT_UNIT:		"fightrendering.battle.right_unit",
		LEFT_STATS:		"fightrendering.battle.left_stats",
		RIGHT_STATS:	"fightrendering.battle.right_stats",
		LEFT_FIGHTER:	"fightrendering.battle.left_fighter",
		RIGHT_FIGHTER:	"fightrendering.battle.right_fighter",
	},

	Layout: {
		LAYOUT_DATA: "fightrendering.layout.layout_data",
	}
};