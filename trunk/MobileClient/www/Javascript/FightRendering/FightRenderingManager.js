//===============================================
// BattleRenderingManager
// Manages the battle rendering screen.
//===============================================
"use strict";

var FightRenderingManager = new function () {
	var self = this;

	var DEFAULT_WIDTH_PORTRAIT = 460;
	var DEFAULT_HEIGHT_PORTRAIT = 720;

	var DEFAULT_WIDTH_LANDSCAPE = 800;
	var DEFAULT_HEIGHT_LANDSCAPE = 480;

	var m_$Screen = $('#Screen');
	var m_$FightScreenContainer = $('#FightScreenContainer');
	var m_$FightScreen = $('#FightScreen');

	var m_fightWorld = null;
	var m_renderer = null;

	var m_currentFight = null;

	var subscriber = new DOMSubscriber();

	//
	// Visualize battle
	//
	this.visualizeBattle = function (eworld, attacker, defender) {
		m_$FightScreenContainer.show();

		m_currentFight = {
			eworld: eworld,
			attacker: attacker,
			defender: defender
		};

		// World doesn't need to play animations in background.
		eworld.getSystem(AnimationSystem).pauseAnimations();

		m_fightWorld.getSystem(AnimationSystem).resumeAnimations();

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

		m_fightWorld.blackboard[FightRenderingBlackBoard.Battle.OUTCOME] = outcome;
		m_fightWorld.blackboard[FightRenderingBlackBoard.Battle.LEFT_UNIT] = leftUnit;
		m_fightWorld.blackboard[FightRenderingBlackBoard.Battle.RIGHT_UNIT] = rightUnit;


		initializeFight();
	};

	var initializeFight = function () {
		m_fightWorld.trigger(FightRenderingEvents.Fight.INITIALIZE);

		//setTimeout(uninitializeFight, 1000 * 5);
	}

	var uninitializeFight = function () {

		m_fightWorld.trigger(FightRenderingEvents.Fight.UNINITIALIZE);

		m_currentFight.eworld.getSystem(AnimationSystem).resumeAnimations();

		m_fightWorld.getSystem(AnimationSystem).pauseAnimations();

		m_currentFight = null;

		m_$FightScreenContainer.hide();
	}

	var restartCurrentFight = function () {
		if (Utils.assert(m_currentFight))
			return;

		// After unitialize, will be set to null.
		var currentFight = m_currentFight;

		uninitializeFight();

		self.visualizeBattle(currentFight.eworld, currentFight.attacker, currentFight.defender);
	}

	//
	// Resizing
	//
	var resizeTimeout;
	var onScreenResize = function (event) {
		
		clearTimeout(resizeTimeout);

		// Give some time for refresh to happen and allow sizes to get applied (as done in iScroll).
		resizeTimeout = setTimeout(function () {
			
			var PADDING = 25;

			var screenWidth = m_$Screen.width() - 2 * PADDING;
			var screenHeight = m_$Screen.height() - 2 * PADDING;

			if (screenWidth >= screenHeight) {
				var width = DEFAULT_WIDTH_LANDSCAPE;
				var height = DEFAULT_HEIGHT_LANDSCAPE;
			} else {
				var width = DEFAULT_WIDTH_PORTRAIT;
				var height = DEFAULT_HEIGHT_PORTRAIT;
			}
			var ratio = width / height;
			var worldWidth = width;
			var worldHeight = height;

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

			m_$FightScreen.width(Math.floor(worldWidth));
			m_$FightScreen.height(Math.floor(worldHeight));

			m_$FightScreen.css('left', Math.floor((screenWidth - width) / 2) + PADDING);
			m_$FightScreen.css('top', Math.floor((screenHeight - height) / 2) + PADDING);


			m_fightWorld.extract(FightRenderer).resize(worldWidth, worldHeight);
			m_fightWorld.extract(FightRenderer).refreshScaleTo(width / worldWidth);
			

			if (m_currentFight != null) {
				restartCurrentFight();
			}

			// For the lack of a better place, manager refreshes layers.
			// Should be after restart to force refresh all layers, like the particles layer.
			m_fightWorld.trigger(RenderEvents.Layers.REFRESH_ALL);
		}, 100);
	}


	subscriber.subscribe(window, 'load', onScreenResize);
	subscriber.subscribe(window, 'resize', onScreenResize);
	subscriber.subscribe(window, 'orientationchange', onScreenResize);

	// DEBUG
	subscriber.subscribe(m_$FightScreen, 'click', uninitializeFight);


	var initialize = function () {

		m_fightWorld = new ECS.EntityWorld();

		m_fightWorld.addSystem(m_fightWorld.store(UtilsSystem, new UtilsSystem()));

		m_renderer = m_fightWorld.store(FightRenderer, FightRenderer.Build(m_$FightScreen[0], m_fightWorld));
		onScreenResize(null);

		m_fightWorld.addSystem(new AnimationSystem(m_renderer));
		m_fightWorld.addSystem(new LayersUpdateSystem(m_renderer, FightRenderer.LayerTypes));
		m_fightWorld.addSystem(new FightControllerSystem(m_renderer));
		m_fightWorld.addSystem(new FightUnitsRenderingSystem(m_renderer));
	}

	initialize();

};
