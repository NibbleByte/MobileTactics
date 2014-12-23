//===============================================
// BattleRenderingManager
// Manages the battle rendering screen.
//===============================================
"use strict";

var BattleRenderingManager = new function () {
	var self = this;

	// Each field is 560x720.
	var STANDARD_WIDTH = 1120;
	var STANDARD_HEIGHT = 720;
	var STANDARD_RATIO = STANDARD_WIDTH / STANDARD_HEIGHT;
	var SCREEN_PADDING = 50;

	var m_$Screen = $('#Screen');
	var m_$BattleScreenContainer = $('#BattleScreenContainer');
	var m_$BattleScreen = $('#BattleScreen');
	
	var subscriber = new DOMSubscriber();


	//
	// Visualize battle
	//
	this.visualizeBattle = function (eworld, attacker, defender) {
		m_$BattleScreenContainer.show();

		var battleSystem = eworld.extract(BattleSystem);
		var gameState = eworld.extract(GameState);
		

		// Choose screen sides
		var leftUnit = attacker;
		var rightUnit = defender;
		if (gameState.currentPlayer == defender.CPlayerData.player) {
			var leftUnit = defender;
			var rightUnit = attacker;
		}

		var outcome = battleSystem.predictOutcome(attacker, defender);

		// Set blackboard params
		self.eworldLeft.blackboard[BattleRenderingBlackBoard.Battle.THIS_UNIT] = leftUnit;
		self.eworldLeft.blackboard[BattleRenderingBlackBoard.Battle.ENEMY_UNIT] = rightUnit;
		self.eworldLeft.blackboard[BattleRenderingBlackBoard.Battle.OUTCOME] = outcome;
		self.eworldLeft.blackboard[BattleRenderingBlackBoard.Battle.IS_ATTACKER] = leftUnit == attacker;

		self.eworldRight.blackboard[BattleRenderingBlackBoard.Battle.THIS_UNIT] = rightUnit;
		self.eworldRight.blackboard[BattleRenderingBlackBoard.Battle.ENEMY_UNIT] = leftUnit;
		self.eworldRight.blackboard[BattleRenderingBlackBoard.Battle.OUTCOME] = outcome;
		self.eworldRight.blackboard[BattleRenderingBlackBoard.Battle.IS_ATTACKER] = rightUnit == attacker;

		initializeBattle();
	};

	var triggerPhase = function (phaseEvent, isAttacker) {
		if (self.eworldLeft.blackboard[BattleRenderingBlackBoard.Battle.IS_ATTACKER] == isAttacker) {
			self.eworldLeft.trigger(phaseEvent);
		} else {
			self.eworldRight.trigger(phaseEvent);
		}
	}

	var m_timeouts = [];
	var triggerPhaseDelayed = function (phaseEvent, isAttacker, timeout) {
		m_timeouts.push(setTimeout(function () {
			triggerPhase(phaseEvent, isAttacker);
		}, timeout));
	}


	var initializeBattle = function () {
		self.eworldLeft.trigger(BattleRenderingEvents.Battle.INITIALIZE);
		self.eworldRight.trigger(BattleRenderingEvents.Battle.INITIALIZE);

		triggerPhaseDelayed(BattleRenderingEvents.Battle.ATTACK, true, 1000 * 2);
		triggerPhaseDelayed(BattleRenderingEvents.Battle.ATTACK, false, 1000 * 2.5);
		triggerPhaseDelayed(BattleRenderingEvents.Battle.DEFEND, false, 1000 * 3);
		triggerPhaseDelayed(BattleRenderingEvents.Battle.DEFEND, true, 1000 * 3.5);

		m_timeouts.push(setTimeout(uninitializeBattle, 1000 * 6.5));
	}

	var uninitializeBattle = function () {
		self.eworldLeft.trigger(BattleRenderingEvents.Battle.UNINITIALIZE);
		self.eworldRight.trigger(BattleRenderingEvents.Battle.UNINITIALIZE);

		m_timeouts = [];

		self.eworldLeft.blackboard[BattleRenderingBlackBoard.Battle.THIS_UNIT] = null;
		self.eworldLeft.blackboard[BattleRenderingBlackBoard.Battle.ENEMY_UNIT] = null;
		self.eworldLeft.blackboard[BattleRenderingBlackBoard.Battle.OUTCOME] = null;

		self.eworldRight.blackboard[BattleRenderingBlackBoard.Battle.THIS_UNIT] = null;
		self.eworldRight.blackboard[BattleRenderingBlackBoard.Battle.ENEMY_UNIT] = null;
		self.eworldRight.blackboard[BattleRenderingBlackBoard.Battle.OUTCOME] = null;

		m_$BattleScreenContainer.hide();
	}


	//
	// Resizing
	//
	var resizeTimeout;
	var onScreenResize = function (event) {
		
		clearTimeout(resizeTimeout);

		// Give some time for refresh to happen and allow sizes to get applied (as done in iScroll).
		resizeTimeout = setTimeout(function () {
			var screenWidth = m_$Screen.width() - 50;
			var screenHeight = m_$Screen.height() - 50;

			var width = STANDARD_WIDTH;
			var height = STANDARD_HEIGHT;
			
			// Letterbox
			if (screenWidth < width || screenHeight < height) {
				var widthDiff = screenWidth - width;
				width += widthDiff;
				height += widthDiff / STANDARD_RATIO;
			
			
				var heightDiff = screenHeight - height;
				if (heightDiff < 0) {
					height += heightDiff;
					width += heightDiff * STANDARD_RATIO;
				}
			}
			
			m_$BattleScreen.width(width);
			m_$BattleScreen.height(height);

			
			self.eworldLeft.extract(BattleFieldRenderer).refreshScaleTo(Math.ceil(width / 2), height);
			self.eworldRight.extract(BattleFieldRenderer).refreshScaleTo(Math.floor(width / 2), height);
		}, 100);
	}


	//
	// Initializing
	//
	var initializeBattleField = function ($field, direction) {
		var eworld = new ECS.EntityWorld();
		var eworldSB = eworld.createSubscriber();

		eworld.addSystem(eworld.store(UtilsSystem, new UtilsSystem()));

		var renderer = eworld.store(BattleFieldRenderer, BattleFieldRenderer.Build($field[0], eworld, direction));
		renderer.extentWidth = STANDARD_WIDTH / 2;
		renderer.extentHeight = STANDARD_HEIGHT;
		renderer.refresh();

		eworld.addSystem(new AnimationSystem(renderer));
		eworld.addSystem(new LayersUpdateSystem(renderer, BattleFieldRenderer.LayerTypes));
		eworld.addSystem(new BattleFieldControllerSystem(renderer));
		eworld.addSystem(new BattleFieldBackgroundSystem(renderer));
		eworld.addSystem(new BattleFieldUnitsRenderingSystem(renderer));
		eworld.addSystem(new BattleFieldUnitsAnimationsController());
		eworld.addSystem(new BattleFieldUnitsParticleSystem(renderer));

		return eworld;
	}

	this.eworldLeft = initializeBattleField($('#BattleFieldLeft'), BattleFieldRenderer.DirectionType.Right);
	this.eworldRight = initializeBattleField($('#BattleFieldRight'), BattleFieldRenderer.DirectionType.Left);

	subscriber.subscribe(window, 'load', onScreenResize);
	subscriber.subscribe(window, 'resize', onScreenResize);
	subscriber.subscribe(window, 'orientationchange', onScreenResize);
};
