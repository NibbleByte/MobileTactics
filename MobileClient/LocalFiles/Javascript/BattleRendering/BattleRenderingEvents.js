//===============================================
// BattleRenderingEvents
//
// Contains battle rendering events.
//===============================================
"use strict";

// Supported render events that user can subscribe to.
var BattleRenderingEvents = {
		Battle: {
			INITIALIZE: "br.battle.initialize",					// Arguments: event, outcome, currentUnit
			ATTACK: "br.battle.attack",							// Arguments: event
			DEFEND: "br.battle.defend",							// Arguments: event
		},
};