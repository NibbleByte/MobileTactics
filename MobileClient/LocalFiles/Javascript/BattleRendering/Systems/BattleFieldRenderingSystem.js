//===============================================
// BattleFieldRenderingSystem
// Renders field.
//===============================================
"use strict";

var BattleFieldRenderingSystem = function (m_renderer) {
	var self = this;
	
	console.assert(m_renderer instanceof SceneRenderer, "SceneRenderer is required.");

	var m_isAttacker = false;
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(BattleRenderingEvents.Battle.INITIALIZE, onInitializeBattle);
	}

	var onInitializeBattle = function (event, outcome, unit) {
		m_isAttacker = unit == outcome.attacker;
	}
}

ECS.EntityManager.registerSystem('BattleFieldRenderingSystem', BattleFieldRenderingSystem);
SystemsUtils.supplySubscriber(BattleFieldRenderingSystem);