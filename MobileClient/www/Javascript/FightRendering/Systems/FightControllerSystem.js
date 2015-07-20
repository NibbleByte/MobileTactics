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
		attackLeft: null,
		attackRight: null,
		attackFinish: null,
	}
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(FightRenderingEvents.Fight.INITIALIZE, onInitializeFight);
		self._eworldSB.subscribe(FightRenderingEvents.Fight.UNINITIALIZE, onUninitializeFight);

		self._eworldSB.subscribe(FightRenderingEvents.Animations.FIRE, onFire);
	}

	var createFightUnit = function (unit, direction, state) {
		var fightUnit = new ECS.Entity();
		fightUnit.addComponent(CFightUnit);
		fightUnit.addComponent(CSpatial);

		fightUnit.CFightUnit.unit = unit;
		fightUnit.CFightUnit.direction = direction;
		fightUnit.CFightUnit.state = state;
		
		return fightUnit;
	}

	var updateUnitPosition = function (tween, unit) {
		
		// On changing screen size causes restart of the fight and units get destroyed.
		// Tweener might still be executing, so just do nothing.
		if (Utils.isInvalidated(unit))
			return;

		unit.CSpatial.x = tween.x;

		self._eworld.trigger(FightRenderingEvents.Units.UNIT_MOVED, unit);
	}

	var onInitializeFight = function (event) {
		
		var leftUnit = self._eworld.blackboard[FightRenderingBlackBoard.Battle.LEFT_UNIT];
		var rightUnit = self._eworld.blackboard[FightRenderingBlackBoard.Battle.RIGHT_UNIT];

		m_leftUnit = createFightUnit(leftUnit, FightRenderer.DirectionType.Right, FightUnitState.ShowingUp);
		m_rightUnit = createFightUnit(rightUnit, FightRenderer.DirectionType.Left, FightUnitState.ShowingUp);

		m_leftUnit.CSpatial.x = -1000;
		m_leftUnit.CSpatial.y = FightRenderingManager.FightFrame.bottom - FightControllerSystem.BOTTOM_OFFSET;

		m_rightUnit.CSpatial.x = -1000;
		m_rightUnit.CSpatial.y = FightRenderingManager.FightFrame.bottom - FightControllerSystem.BOTTOM_OFFSET;

		self._eworld.blackboard[FightRenderingBlackBoard.Battle.LEFT_FIGHTER] = m_leftUnit;
		self._eworld.blackboard[FightRenderingBlackBoard.Battle.RIGHT_FIGHTER] = m_rightUnit;

		self._eworld.addUnmanagedEntity(m_leftUnit);
		self._eworld.addUnmanagedEntity(m_rightUnit);

		m_timeouts.showUp = setTimeout(onShowUp, 500);
	}

	var onShowUp = function () {
		var leftTween = { x: -FightRenderingManager.FIGHT_FRAME_WIDTH_HALF };
		var rightTween = { x: m_renderer.extentWidth + FightRenderingManager.FIGHT_FRAME_WIDTH_HALF };

		var leftXEnd = FightRenderingManager.FightFrame.leftHalf;
		var rightXEnd = FightRenderingManager.FightFrame.rightHalf;

		var leftParams = [ leftTween, m_leftUnit ];
		var rightParams = [ rightTween, m_rightUnit ];

		Tweener.addTween(leftTween, {x: leftXEnd, time: 1, delay: 0, transition: "easeOutBack", onUpdate: updateUnitPosition, onUpdateParams: leftParams, onComplete: onShowUpFinished, onCompleteParams: leftParams });
		Tweener.addTween(rightTween, {x: rightXEnd, time: 1, delay: 0, transition: "easeOutBack", onUpdate: updateUnitPosition, onUpdateParams: rightParams });
	}

	// NOTE: Called only for the left unit.
	var onShowUpFinished = function (tween, unit) {

		// On changing screen size causes restart of the fight and units get destroyed.
		// Tweener might still be executing, so just do nothing.
		if (Utils.isInvalidated(unit))
			return;

		m_leftUnit.CFightUnit.state = FightUnitState.Idle;
		m_rightUnit.CFightUnit.state = FightUnitState.Idle;

		self._eworld.trigger(FightRenderingEvents.Fight.SHOW_UP_FINISH);

		m_timeouts.attackLeft = setTimeout(function () { onAttack(m_leftUnit); }, 500);
		m_timeouts.attackRight = setTimeout(function () { onAttack(m_rightUnit); }, 2000);
		m_timeouts.attackFinish = setTimeout(onAttackFinish, 3500);
	}

	var onAttack = function (unit) {
		
		unit.CFightUnit.state = FightUnitState.Attacking;

		self._eworld.trigger(FightRenderingEvents.Fight.ATTACK, unit);
	}

	var onAttackFinish = function () {

		m_leftUnit.CFightUnit.state = FightUnitState.Idle;
		m_rightUnit.CFightUnit.state = FightUnitState.Idle;

		self._eworld.trigger(FightRenderingEvents.Fight.ATTACK_FINISH);

	}

	var onFire = function (event, animData, params) {
		var hurtUnit = (animData.entity == m_leftUnit) ? m_rightUnit : m_leftUnit;

		self._eworld.trigger(FightRenderingEvents.Animations.HURT, hurtUnit, params);
	}

	var onUninitializeFight = function (event) {
		m_leftUnit.destroy();
		m_leftUnit = null;

		m_rightUnit.destroy();
		m_rightUnit = null;

		self._eworld.blackboard[FightRenderingBlackBoard.Battle.LEFT_FIGHTER] = null;
		self._eworld.blackboard[FightRenderingBlackBoard.Battle.RIGHT_FIGHTER] = null;

		for(var timeout in m_timeouts) {
			clearTimeout(m_timeouts[timeout]);
		}
	}
}

FightControllerSystem.BOTTOM_OFFSET = 25;

ECS.EntityManager.registerSystem('FightControllerSystem', FightControllerSystem);
SystemsUtils.supplySubscriber(FightControllerSystem);