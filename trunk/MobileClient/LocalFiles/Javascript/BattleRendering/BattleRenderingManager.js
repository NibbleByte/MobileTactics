//===============================================
// BattleRenderingManager
// Manages the battle rendering screen.
//===============================================
"use strict";

var BattleRenderingManager = new function () {
	var self = this;
	
	var FIELD_WIDTH_PORTRAIT = 460;
	var FIELD_WIDTH_LANDSCAPE = 560;
	var FIELD_WIDTH_LANDSCAPE_FULL = 1120;	// Each field is 560.
	var FIELD_HEIGHT_PORTRAIT = 720;
	var FIELD_HEIGHT_LANDSCAPE = 480;
	var LANDSCAPE_WIDTH_MIN = FIELD_WIDTH_LANDSCAPE_FULL * 0.75;	// Width threshold to switch between portrait & landscape

	var m_$Screen = $('#Screen');
	var m_$BattleScreenContainer = $('#BattleScreenContainer');
	var m_$BattleScreen = $('#BattleScreen');

	var m_$BattleFieldsContainer = $('#BattleFields');
	var m_landscape = false;
	var m_fieldWidth = 0;
	var m_fieldHeight = 0;

	var m_currentBattle = null;

	var m_ticker = null;
	
	var subscriber = new DOMSubscriber();


	//
	// Visualize battle
	//
	this.visualizeBattle = function (eworld, attacker, defender) {
		m_$BattleScreenContainer.show();

		m_currentBattle = {
			eworld: eworld,
			attacker: attacker,
			defender: defender
		};

		// World doesn't need to play animations in background.
		eworld.getSystem(AnimationSystem).pauseAnimations();

		// Start animating when actually showing.
		m_ticker.resume();


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


		self.eworldLeft.blackboard[BattleRenderingBlackBoard.Battle.ACTIVE] = true;
		self.eworldRight.blackboard[BattleRenderingBlackBoard.Battle.ACTIVE] = true;

		if (m_landscape) {
			initializeBattleLandscape();
		} else {
			initializeBattlePortrait();
		}
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
	
	var triggerScrollByDelayed = function (x, y, timeout) {
		m_timeouts.push(setTimeout(function () {
			m_FieldScroller.scrollBy(x, y, 1000, IScroll.utils.ease.circular);
		}, timeout));
	}


	var initializeBattleLandscape = function () {
		self.eworldLeft.trigger(BattleRenderingEvents.Battle.INITIALIZE);
		self.eworldRight.trigger(BattleRenderingEvents.Battle.INITIALIZE);

		triggerPhaseDelayed(BattleRenderingEvents.Battle.ATTACK, true, 1000 * 2);
		triggerPhaseDelayed(BattleRenderingEvents.Battle.ATTACK, false, 1000 * 2.5);
		triggerPhaseDelayed(BattleRenderingEvents.Battle.DEFEND, false, 1000 * 3);
		triggerPhaseDelayed(BattleRenderingEvents.Battle.DEFEND, true, 1000 * 3.5);

		triggerPhaseDelayed(BattleRenderingEvents.Battle.HIT, false, 1000 * 3.2);
		triggerPhaseDelayed(BattleRenderingEvents.Battle.HIT, true, 1000 * 3.7);

		m_timeouts.push(setTimeout(uninitializeBattle, 1000 * 6.5));
	}

	var initializeBattlePortrait = function () {
		self.eworldLeft.trigger(BattleRenderingEvents.Battle.INITIALIZE);
		self.eworldRight.trigger(BattleRenderingEvents.Battle.INITIALIZE);

		scrollerRefresh();

		m_FieldScroller.scrollTo(0, 0, 0);

		triggerPhaseDelayed(BattleRenderingEvents.Battle.ATTACK, true, 1000 * 2);

		// Go to defender
		triggerScrollByDelayed(-m_fieldWidth, 0, 1000 * 3);

		triggerPhaseDelayed(BattleRenderingEvents.Battle.DEFEND, false, 1000 * 5);
		triggerPhaseDelayed(BattleRenderingEvents.Battle.HIT, false, 1000 * 5.2);

		triggerPhaseDelayed(BattleRenderingEvents.Battle.ATTACK, false, 1000 * 6);


		// Go to attacker
		triggerScrollByDelayed(m_fieldWidth, 0, 1000 * 7);
		
		triggerPhaseDelayed(BattleRenderingEvents.Battle.DEFEND, true, 1000 * 9);
		triggerPhaseDelayed(BattleRenderingEvents.Battle.HIT, true, 1000 * 9.2);

		m_timeouts.push(setTimeout(uninitializeBattle, 1000 * 12));
	}

	var uninitializeBattle = function () {
		self.eworldLeft.trigger(BattleRenderingEvents.Battle.UNINITIALIZE);
		self.eworldRight.trigger(BattleRenderingEvents.Battle.UNINITIALIZE);

		for(var i = 0; i < m_timeouts.length; ++i) {
			clearTimeout(m_timeouts[i]);
		}

		m_timeouts = [];

		self.eworldLeft.blackboard[BattleRenderingBlackBoard.Battle.THIS_UNIT] = null;
		self.eworldLeft.blackboard[BattleRenderingBlackBoard.Battle.ENEMY_UNIT] = null;
		self.eworldLeft.blackboard[BattleRenderingBlackBoard.Battle.OUTCOME] = null;

		self.eworldRight.blackboard[BattleRenderingBlackBoard.Battle.THIS_UNIT] = null;
		self.eworldRight.blackboard[BattleRenderingBlackBoard.Battle.ENEMY_UNIT] = null;
		self.eworldRight.blackboard[BattleRenderingBlackBoard.Battle.OUTCOME] = null;


		self.eworldLeft.blackboard[BattleRenderingBlackBoard.Battle.ACTIVE] = false;
		self.eworldRight.blackboard[BattleRenderingBlackBoard.Battle.ACTIVE] = false;

		// Don't animate if hiding.
		m_ticker.pause();

		m_currentBattle.eworld.getSystem(AnimationSystem).resumeAnimations();

		m_currentBattle = null;

		m_$BattleScreenContainer.hide();
	}

	var restartCurrentBattle = function () {
		if (Utils.assert(m_currentBattle))
			return;

		// After unitialize, will be set to null.
		var currentBattle = m_currentBattle;

		uninitializeBattle();

		m_FieldScroller.scrollTo(0, 0, 0);

		self.visualizeBattle(currentBattle.eworld, currentBattle.attacker, currentBattle.defender);
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

			if (screenWidth >= LANDSCAPE_WIDTH_MIN || screenWidth >= screenHeight) {
				var width = FIELD_WIDTH_LANDSCAPE_FULL;
				var height = FIELD_HEIGHT_LANDSCAPE;
				m_landscape = true;
			} else {
				var width = FIELD_WIDTH_PORTRAIT;
				var height = FIELD_HEIGHT_PORTRAIT;
				m_landscape = false;
			}
			var ratio = width / height;

			
			// Letterbox
			if (screenWidth < width || screenHeight < height) {
				var widthDiff = screenWidth - width;
				width += widthDiff;
				height += widthDiff / ratio;
			
			
				var heightDiff = screenHeight - height;
				if (heightDiff < 0) {
					height += heightDiff;
					width += heightDiff * ratio;
				}
			}
			
			m_$BattleScreen.width(width);
			m_$BattleScreen.height(height);
			
			// The fields container, to create the scrolling effect.
			if (m_landscape) {
				m_$BattleFieldsContainer.width('100%');
			} else {
				m_$BattleFieldsContainer.width(width * 2);
			}


			// Canvas size
			var canvasWidth = (m_landscape) ? FIELD_WIDTH_LANDSCAPE : FIELD_WIDTH_PORTRAIT;
			var canvasHeight = (m_landscape) ? FIELD_HEIGHT_LANDSCAPE : FIELD_HEIGHT_PORTRAIT;
			self.eworldLeft.extract(BattleFieldRenderer).resize(canvasWidth, canvasHeight);
			self.eworldRight.extract(BattleFieldRenderer).resize(canvasWidth, canvasHeight);

			
			// Scale down to fit screen
			m_fieldWidth = (m_landscape) ? Math.ceil(width / 2) : width;
			m_fieldHeight = height;
			self.eworldLeft.extract(BattleFieldRenderer).refreshScaleTo(m_fieldWidth, height);
			self.eworldRight.extract(BattleFieldRenderer).refreshScaleTo(m_fieldWidth, height);


			// Canvases have been invalidated due to resize, so they need to be redrawn.
			self.eworldLeft.trigger(BattleRenderingEvents.Render.FIELD_RESIZED);
			self.eworldRight.trigger(BattleRenderingEvents.Render.FIELD_RESIZED);

			if (m_currentBattle != null) {
				restartCurrentBattle();
			}

			// For the lack of a better place, manager refreshes layers.
			// Should be after restart to force refresh all layers, like the particles layer.
			self.eworldLeft.trigger(RenderEvents.Layers.REFRESH_ALL);
			self.eworldRight.trigger(RenderEvents.Layers.REFRESH_ALL);

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
		renderer.extentWidth = FIELD_WIDTH_LANDSCAPE;
		renderer.extentHeight = FIELD_HEIGHT_LANDSCAPE;
		renderer.refresh();

		eworld.addSystem(new AnimationSystem(renderer, true));
		eworld.addSystem(new LayersUpdateSystem(renderer, BattleFieldRenderer.LayerTypes));
		eworld.addSystem(new BattleFieldControllerSystem(renderer));
		eworld.addSystem(new BattleFieldBackgroundSystem(renderer));
		eworld.addSystem(new BattleFieldUnitsRenderingSystem(renderer));
		eworld.addSystem(new BattleFieldUnitsAnimationsController());
		eworld.addSystem(new BattleFieldUnitsParticleSystem(renderer));

		return eworld;
	}

	// Combine both eworlds animations in one ticker (less events, better performance).
	var paint = function (ticker) {
		self.eworldLeft.getSystem(AnimationSystem).paint(ticker);
		self.eworldRight.getSystem(AnimationSystem).paint(ticker);
	}

	var initializeTicker = function () {
		m_ticker = self.eworldLeft.extract(BattleFieldRenderer).scene.Ticker(paint, { tickDuration: 16, useAnimationFrame: true });
		m_ticker.run();

		// Don't try to animate anything on start.
		m_ticker.pause();
	}

	this.eworldLeft = initializeBattleField($('#BattleFieldLeft'), BattleFieldRenderer.DirectionType.Right);
	this.eworldRight = initializeBattleField($('#BattleFieldRight'), BattleFieldRenderer.DirectionType.Left);
	initializeTicker();

	subscriber.subscribe(window, 'load', onScreenResize);
	subscriber.subscribe(window, 'resize', onScreenResize);
	subscriber.subscribe(window, 'orientationchange', onScreenResize);


	// Scrolling portrait mode
	var m_FieldScroller = new IScroll(m_$BattleScreen[0], {
			freeScroll: true,
			keyBindings: false,
			mouseWheel: false,
			scrollX: true,
			scrollY: true,
			scrollbars: false,
			fadeScrollbars: false,
			disableMouse: true,
			disablePointer: true,
			disableTouch: true,
			bounce: false,
		});


	// Refreshes scroller.
	// Some phones can't pick it up from the first time.
	var scrollerRefreshTimeout = null;	// Avoid firing multiple timeouts.
	var scrollerRefresh = function () {

		if (scrollerRefreshTimeout == null) {
			scrollerRefreshTimeout = setTimeout(function () {
				scrollerRefreshTimeout = null;
				m_FieldScroller.refresh();

			}, 200);
		}
	}
};
