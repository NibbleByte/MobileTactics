//===============================================
// BattleFieldControllerSystem
// Prepares field, places units.
//===============================================
"use strict";

var BattleFieldControllerSystem = function (m_renderer) {
	var self = this;

	console.assert(m_renderer instanceof SceneRenderer, "SceneRenderer is required.");
	
	var m_battleUnits = [];
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(BattleRenderingEvents.Battle.INITIALIZE, onInitializeBattle);
		self._eworldSB.subscribe(BattleRenderingEvents.Battle.HIT, onHit);
		self._eworldSB.subscribe(BattleRenderingEvents.Battle.UNINITIALIZE, onUninitializeBattle);
	}

	var onInitializeBattle = function (event) {

		var unit = self._eworld.blackboard[BattleRenderingBlackBoard.Battle.THIS_UNIT];

		var formationRow = 1;			// How many rows is currently the formation.
		var formationRowUnits = 0;		// How many units per row.
		var count = unit.CUnit.health;	// TODO: Add some coefficient

		for(var i = 0; i < count; ++i) {
			var battleUnit = new ECS.Entity();
			battleUnit.addComponent(CBattleUnit);
			battleUnit.addComponent(CSpatial);

			battleUnit.CBattleUnit.unit = unit;


			// Do some formation. Pyramid for now.
			battleUnit.CSpatial.x = formationRow * 100;
			var yOffset = 75 * Math.ceil(formationRowUnits / 2);
			yOffset *= (formationRowUnits % 2) ? 1 : -1;
			battleUnit.CSpatial.y = m_renderer.extentHeight - 200 + yOffset;


			++formationRowUnits;
			if (formationRow * 2 - 1 == formationRowUnits) {
				formationRowUnits = 0;
				++formationRow;
			}


			m_battleUnits.push(battleUnit);
			self._eworld.addUnmanagedEntity(battleUnit);
		}
	}

	var onHit = function (event) {
		var alive = m_battleUnits.clone();
		var dieCount = MathUtils.randomIntRange(Math.min(1, alive.length), Math.floor(alive.length / 2));


		for(var i = 0; i < dieCount; ++i) {
			var index = MathUtils.randomInt(alive.length);

			var battleUnit = alive[index];
			alive.removeAt(index);

			self._eworld.triggerAsync(BattleRenderingEvents.Units.UNIT_KILLED, battleUnit);
			battleUnit.CBattleUnit.killed = true;
		}
	}

	var onUninitializeBattle = function (event) {
		for(var i = 0; i < m_battleUnits.length; ++i) {
			m_battleUnits[i].destroy();
		}

		m_battleUnits = [];
	}
}

ECS.EntityManager.registerSystem('BattleFieldControllerSystem', BattleFieldControllerSystem);
SystemsUtils.supplySubscriber(BattleFieldControllerSystem);