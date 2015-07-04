//===============================================
// FightControllerSystem
// Prepares fight, places units.
//===============================================
"use strict";

var FightControllerSystem = function (m_renderer) {
	var self = this;

	console.assert(m_renderer instanceof SceneRenderer, "SceneRenderer is required.");
	
	var m_leftUnit = null;
	var m_rightUnit = null;

	var m_timeouts = {
		showUp: null,
		Idle: null,
	}
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(FightRenderingEvents.Fight.INITIALIZE, onInitializeFight);
		self._eworldSB.subscribe(FightRenderingEvents.Fight.SHOW_UP, onShowUp);
		self._eworldSB.subscribe(FightRenderingEvents.Fight.UNINITIALIZE, onUninitializeFight);
	}

	var createFightUnit = function (unit, direction) {
		var fightUnit = new ECS.Entity();
		fightUnit.addComponent(CFightUnit);
		fightUnit.addComponent(CSpatial);

		fightUnit.CFightUnit.unit = unit;
		fightUnit.CFightUnit.direction = direction;
		
		return fightUnit;
	}

	var updateUnitPosition = function (tween, unit) {
		unit.CSpatial.x = tween.x;

		self._eworld.trigger(FightRenderingEvents.Units.UNIT_MOVED, unit);
	}

	var onInitializeFight = function (event) {
		
		var leftUnit = self._eworld.blackboard[FightRenderingBlackBoard.Battle.LEFT_UNIT];
		var rightUnit = self._eworld.blackboard[FightRenderingBlackBoard.Battle.RIGHT_UNIT];

		m_leftUnit = createFightUnit(leftUnit, FightRenderer.DirectionType.Right);
		m_rightUnit = createFightUnit(rightUnit, FightRenderer.DirectionType.Left);

		m_leftUnit.CSpatial.x = -1000;
		m_leftUnit.CSpatial.y = FightRenderingManager.FightFrame.bottom - FightControllerSystem.BOTTOM_OFFSET;

		m_rightUnit.CSpatial.x = -1000;
		m_rightUnit.CSpatial.y = FightRenderingManager.FightFrame.bottom - FightControllerSystem.BOTTOM_OFFSET;

		self._eworld.addUnmanagedEntity(m_leftUnit);
		self._eworld.addUnmanagedEntity(m_rightUnit);

		m_timeouts.showUp = setTimeout(onShowUp, 500);
	}

	var onShowUp = function () {
		var leftTween = { x: FightRenderingManager.FightFrame.left - FightRenderingManager.FIGHT_FRAME_WIDTH_HALF };
		var rightTween = { x: FightRenderingManager.FightFrame.right + FightRenderingManager.FIGHT_FRAME_WIDTH_HALF };

		var leftXEnd = FightRenderingManager.FightFrame.leftHalf;
		var rightXEnd = FightRenderingManager.FightFrame.rightHalf;

		var leftParams = [ leftTween, m_leftUnit ];
		var rightParams = [ rightTween, m_rightUnit ];

		Tweener.addTween(leftTween, {x: leftXEnd, time: 1, delay: 0, transition: "easeOutBack", onUpdate: updateUnitPosition, onUpdateParams: leftParams });
		Tweener.addTween(rightTween, {x: rightXEnd, time: 1, delay: 0, transition: "easeOutBack", onUpdate: updateUnitPosition, onUpdateParams: rightParams });
	}

	var onUninitializeFight = function (event) {
		m_leftUnit.destroy();
		m_leftUnit = null;

		m_rightUnit.destroy();
		m_rightUnit = null;

		for(var timeout in m_timeouts) {
			clearTimeout(m_timeouts[timeout]);
		}
	}
}

FightControllerSystem.BOTTOM_OFFSET = 5;

ECS.EntityManager.registerSystem('FightControllerSystem', FightControllerSystem);
SystemsUtils.supplySubscriber(FightControllerSystem);