//===============================================
// FightControllerSystem
// Prepares fight, places units.
//===============================================
"use strict";

var FightControllerSystem = function (m_renderer) {
	var self = this;

	console.assert(m_renderer instanceof SceneRenderer, "SceneRenderer is required.");
	
	var m_fightUnits = [];
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(FightRenderingEvents.Fight.INITIALIZE, onInitializeBattle);
		self._eworldSB.subscribe(FightRenderingEvents.Fight.UNINITIALIZE, onUninitializeBattle);
	}

	var createFightUnit = function (unit, direction) {
		var fightUnit = new ECS.Entity();
		fightUnit.addComponent(CFightUnit);
		fightUnit.addComponent(CSpatial);

		fightUnit.CFightUnit.unit = unit;
		fightUnit.CFightUnit.direction = direction;

		m_fightUnits.push(fightUnit);
		
		return fightUnit;
	}

	var onInitializeBattle = function (event) {
		
		var leftUnit = self._eworld.blackboard[FightRenderingBlackBoard.Battle.LEFT_UNIT];
		var rightUnit = self._eworld.blackboard[FightRenderingBlackBoard.Battle.RIGHT_UNIT];

		var leftFightUnit = createFightUnit(leftUnit, FightRenderer.DirectionType.Right);
		var rightFightUnit = createFightUnit(rightUnit, FightRenderer.DirectionType.Left);

		leftFightUnit.CSpatial.x = FightRenderingManager.FightFrame.left + FightRenderingManager.FIGHT_FRAME_WIDTH_HALF / 2;
		leftFightUnit.CSpatial.y = FightRenderingManager.FightFrame.bottom;

		rightFightUnit.CSpatial.x = FightRenderingManager.FightFrame.right - FightRenderingManager.FIGHT_FRAME_WIDTH_HALF / 2;
		rightFightUnit.CSpatial.y = FightRenderingManager.FightFrame.bottom;

		self._eworld.addUnmanagedEntity(leftFightUnit);
		self._eworld.addUnmanagedEntity(rightFightUnit);
	}

	var onUninitializeBattle = function (event) {
		for(var i = 0; i < m_fightUnits.length; ++i) {
			m_fightUnits[i].destroy();
		}

		m_fightUnits = [];
	}
}

ECS.EntityManager.registerSystem('FightControllerSystem', FightControllerSystem);
SystemsUtils.supplySubscriber(FightControllerSystem);