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
	var m_attackingUnitsOrder = [];

	var m_timeouts = {
		showUp: null,
		attackPrepare: null,
		attackFinish: null,
		outro: null,
	}
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(FightRenderingEvents.Fight.INITIALIZE, onInitializeFight);
		self._eworldSB.subscribe(FightRenderingEvents.Fight.START_FIGHT, onStartFight);
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
		if (!Utils.isValidEntity(unit))
			return;

		if (!unit.CSpatial) {
			console.log(Utils.stringifyShallow(unit, true));
		}

		if (tween.x !== undefined) unit.CSpatial.x = tween.x;
		if (tween.y !== undefined) unit.CSpatial.y = tween.y;

		self._eworld.trigger(FightRenderingEvents.Units.UNIT_MOVED, unit);
		self._eworld.trigger(FightRenderingEvents.Layout.REFRESH_UNIT_LAYOUT, unit);
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
		m_leftUnit.CSpatial.y = -1000;

		m_rightUnit.CSpatial.x = -1000;
		m_rightUnit.CSpatial.y = -1000;

		self._eworld.blackboard[FightRenderingBlackBoard.Battle.LEFT_FIGHTER] = m_leftUnit;
		self._eworld.blackboard[FightRenderingBlackBoard.Battle.RIGHT_FIGHTER] = m_rightUnit;

		self._eworld.addUnmanagedEntity(m_leftUnit);
		self._eworld.addUnmanagedEntity(m_rightUnit);

	}

	var onStartFight = function () {
		m_timeouts.showUp = setTimeout(onShowUp, 500);
	}

	var onShowUp = function () {

		self._eworld.trigger(FightRenderingEvents.Layout.REFRESH_UNIT_LAYOUT, m_leftUnit);
		self._eworld.trigger(FightRenderingEvents.Layout.REFRESH_UNIT_LAYOUT, m_rightUnit);
		var layoutData = self._eworld.blackboard[FightRenderingBlackBoard.Layout.LAYOUT_DATA];

		m_leftUnit.CSpatial.x = layoutData.directionalLayout[FightRenderer.DirectionType.Right].unitShowUpPosition.x;
		m_rightUnit.CSpatial.x = layoutData.directionalLayout[FightRenderer.DirectionType.Left].unitShowUpPosition.x;

		var leftTween = { y: -layoutData.UNIT_BOX_HEIGHT };
		var rightTween = { y: m_renderer.extentHeight + layoutData.UNIT_BOX_HEIGHT };

		var leftYEnd = layoutData.directionalLayout[FightRenderer.DirectionType.Right].unitShowUpPosition.y;
		var rightYEnd = layoutData.directionalLayout[FightRenderer.DirectionType.Left].unitShowUpPosition.y;

		var leftParams = [ leftTween, m_leftUnit ];
		var rightParams = [ rightTween, m_rightUnit ];

		Tweener.addTween(leftTween, {y: leftYEnd, time: 1, delay: 0, transition: 'easeOutBack', onUpdate: updateUnitPosition, onUpdateParams: leftParams, onComplete: onShowUpFinished, onCompleteParams: leftParams });
		Tweener.addTween(rightTween, {y: rightYEnd, time: 1, delay: 0, transition: 'easeOutBack', onUpdate: updateUnitPosition, onUpdateParams: rightParams });
	}

	// NOTE: Called only for the left unit.
	var onShowUpFinished = function (tween, unit) {

		// On changing screen size causes restart of the fight and units get destroyed.
		// Tweener might still be executing, so just do nothing.
		if (!Utils.isValidEntity(unit))
			return;

		m_leftUnit.CFightUnit.state = FightUnitState.Idle;
		m_rightUnit.CFightUnit.state = FightUnitState.Idle;

		self._eworld.trigger(FightRenderingEvents.Fight.SHOW_UP_FINISH);


		if (m_defenderFightsBack) {
			m_attackingUnitsOrder.push(m_attackerUnit);
			m_attackingUnitsOrder.push(m_defenderUnit);
		} else {
			m_attackingUnitsOrder.push(m_attackerUnit);
		}


		m_timeouts.attackPrepare = setTimeout(function () { onAttack( m_attackingUnitsOrder[0] ) }, 500);
	}

	var onAttack = function (unit) {
		
		unit.CFightUnit.state = FightUnitState.AttackReady;

	}

	var onAttackFinish = function (unit) {

		unit.CFightUnit.state = FightUnitState.Idle;

		m_attackingUnitsOrder.shift();

		if (m_attackingUnitsOrder.length == 0) {
			self._eworld.trigger(FightRenderingEvents.Fight.ATTACKS_FINALIZE);

			var timeout = 750;
			if (m_attackerUnit.CFightUnit.state == FightUnitState.Dead || m_defenderUnit.CFightUnit.state == FightUnitState.Dead)
				timeout += 1500;

			m_timeouts.outro = setTimeout(onHideOut, timeout);
		} else {
			m_timeouts.attackPrepare = setTimeout(function () { onAttack( m_attackingUnitsOrder[0] ) }, 300);
		}
	}

	var onHideOut = function () {

		self._eworld.trigger(FightRenderingEvents.Layout.REFRESH_UNIT_LAYOUT, m_leftUnit);
		self._eworld.trigger(FightRenderingEvents.Layout.REFRESH_UNIT_LAYOUT, m_rightUnit);
		var layoutData = self._eworld.blackboard[FightRenderingBlackBoard.Layout.LAYOUT_DATA];

		var leftTween = { x: m_leftUnit.CSpatial.x };
		var rightTween = { x: m_rightUnit.CSpatial.x };

		var leftXEnd = layoutData.directionalLayout[FightRenderer.DirectionType.Right].unitHideOutPosition.x;
		var rightXEnd = layoutData.directionalLayout[FightRenderer.DirectionType.Left].unitHideOutPosition.x;

		var leftParams = [ leftTween, m_leftUnit ];
		var rightParams = [ rightTween, m_rightUnit ];

		Tweener.addTween(leftTween, {x: leftXEnd, time: 0.5, delay: 0, transition: 'easeInExpo', onUpdate: updateUnitPosition, onUpdateParams: leftParams, onComplete: onHideOutFinished, onCompleteParams: leftParams });
		Tweener.addTween(rightTween, {x: rightXEnd, time: 0.5, delay: 0, transition: 'easeInExpo', onUpdate: updateUnitPosition, onUpdateParams: rightParams });
	}

	// NOTE: Called only for the left unit.
	var onHideOutFinished = function (tween, unit) {

		if (!Utils.isValidEntity(unit))
			return;

		self._eworld.trigger(FightRenderingEvents.Fight.OUTRO_FINALIZE);
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

		m_attackingUnitsOrder = [];

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