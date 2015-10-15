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
	var m_attackerUnit = null;
	var m_defenderUnit = null;
	var m_isLeftAttacker = false;
	var m_defenderFightsBack = true;
	var m_attacksExpected = 0;

	var m_timeouts = {
		showUp: null,
		attackLeft: null,
		attackRight: null,
		attackFinish: null,
		endTauntLeft: null,
		endTauntRight: null,
	}
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(FightRenderingEvents.Fight.INITIALIZE, onInitializeFight);
		self._eworldSB.subscribe(FightRenderingEvents.Fight.UNINITIALIZE, onUninitializeFight);

		self._eworldSB.subscribe(FightRenderingEvents.Fight.ATTACK_FINISH, onAttackFinish);
		self._eworldSB.subscribe(FightRenderingEvents.Animations.FIRE, onFire);
	}

	var createFightUnit = function (unit, direction, state, battleStats) {
		var fightUnit = new ECS.Entity();
		fightUnit.addComponent(CFightUnit);
		fightUnit.addComponent(CSpatial);

		fightUnit.CFightUnit.unit = unit;
		fightUnit.CFightUnit.direction = direction;
		fightUnit.CFightUnit.state = state;
		fightUnit.CFightUnit.battleStats = battleStats;
		
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

	var onInitializeFight = function () {
		
		var leftUnit = self._eworld.blackboard[FightRenderingBlackBoard.Battle.LEFT_UNIT];
		var rightUnit = self._eworld.blackboard[FightRenderingBlackBoard.Battle.RIGHT_UNIT];

		var leftStats = self._eworld.blackboard[FightRenderingBlackBoard.Battle.LEFT_STATS];
		var rightStats = self._eworld.blackboard[FightRenderingBlackBoard.Battle.RIGHT_STATS];

		// Recognize who has to attack first.
		m_isLeftAttacker = leftStats.isAttacker;
		m_defenderFightsBack = (m_isLeftAttacker) ? rightStats.canFire : leftStats.canFire;

		m_leftUnit = createFightUnit(leftUnit, FightRenderer.DirectionType.Right, FightUnitState.ShowingUp, leftStats);
		m_rightUnit = createFightUnit(rightUnit, FightRenderer.DirectionType.Left, FightUnitState.ShowingUp, rightStats);

		m_attackerUnit = (m_isLeftAttacker) ? m_leftUnit : m_rightUnit;
		m_defenderUnit = (m_isLeftAttacker) ? m_rightUnit : m_leftUnit;

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


		if (m_defenderFightsBack) {
			m_timeouts.attackLeft = setTimeout(function () { onAttack( m_attackerUnit ); }, 500);
			m_timeouts.attackRight = setTimeout(function () { onAttack( m_defenderUnit ); }, 2000);
			m_attacksExpected = 2;
		} else {
			m_timeouts.attackLeft = setTimeout(function () { onAttack( m_attackerUnit ) }, 500);
			m_timeouts.attackRight = null;
			m_attacksExpected = 1;

		}
	}

	var onAttack = function (unit) {
		
		unit.CFightUnit.state = FightUnitState.Attacking;

		self._eworld.trigger(FightRenderingEvents.Fight.ATTACK, unit);
	}

	var onAttackFinish = function (unit) {

		unit.CFightUnit.state = FightUnitState.Idle;

		m_attacksExpected--;

		if (m_attacksExpected == 0) {
			self._eworld.trigger(FightRenderingEvents.Fight.ATTACKS_FINALIZE);

			if (m_attackerUnit.CFightUnit.state != FightUnitState.Dead)
				m_timeouts.endTauntLeft = setTimeout(function () { onEndTaunt( m_attackerUnit ); }, 250);

			if (m_defenderUnit.CFightUnit.state != FightUnitState.Dead) 
				m_timeouts.endTauntRight = setTimeout(function () { onEndTaunt( m_defenderUnit ); }, 750);
		}
	}

	var onEndTaunt = function (unit) {
		self._eworld.trigger(FightRenderingEvents.Fight.END_TAUNT, unit);
	}

	var onFire = function (animData, params) {
		var hurtUnit = (animData.entity == m_leftUnit) ? m_rightUnit : m_leftUnit;

		self._eworld.trigger(FightRenderingEvents.Animations.HURT, hurtUnit, params);

		if (params.final && hurtUnit.CFightUnit.battleStats.dies) {
			hurtUnit.CFightUnit.state = FightUnitState.Dead;
			self._eworld.trigger(FightRenderingEvents.Animations.DIES, hurtUnit);
		}
	}

	var onUninitializeFight = function () {
		m_leftUnit.destroy();
		m_leftUnit = null;

		m_rightUnit.destroy();
		m_rightUnit = null;

		m_attackerUnit = null;
		m_defenderUnit = null;

		self._eworld.blackboard[FightRenderingBlackBoard.Battle.LEFT_FIGHTER] = null;
		self._eworld.blackboard[FightRenderingBlackBoard.Battle.RIGHT_FIGHTER] = null;

		for(var timeout in m_timeouts) {
			clearTimeout(m_timeouts[timeout]);
		}
	}
}

FightControllerSystem.BOTTOM_OFFSET = 40;

ECS.EntityManager.registerSystem('FightControllerSystem', FightControllerSystem);
SystemsUtils.supplySubscriber(FightControllerSystem);