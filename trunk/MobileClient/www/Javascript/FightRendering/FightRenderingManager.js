//===============================================
// BattleRenderingManager
// Manages the battle rendering screen.
//===============================================
"use strict";

var FightRenderingManager = new function () {
	var self = this;

	this.FIGHT_FRAME_WIDTH_HALF = 150 * Assets.scale;
	this.FIGHT_FRAME_HEIGHT = 300 * Assets.scale;
	this.FIGHT_FRAME_WIDTH = this.FIGHT_FRAME_WIDTH_HALF * 2;

	// This will be updated with the current fight frame position in the screen.
	this.FightFrame = {
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		width: this.FIGHT_FRAME_WIDTH,
		height: this.FIGHT_FRAME_HEIGHT,

		leftHalf: 0,
		rightHalf: 0,
	}

	var m_$Screen = $('#Screen');
	var m_$FightScreenContainer = $('#FightScreenContainer');
	var m_$FightScreen = $('#FightScreen');
	var m_$FightFrame = $('#FightFrame');

	var m_$worldShot = $('#GameWorldMapShot');

	var m_fightWorld = null;
	var m_renderer = null;

	var m_currentFight = null;

	var subscriber = new DOMSubscriber();

	var shotLayers = [
		WorldLayers.LayerTypes.Terrain,
		WorldLayers.LayerTypes.TerrainOverlay,
		WorldLayers.LayerTypes.Units,
		//WorldLayers.LayerTypes.UnitsFinished, // Shot doesn't check if div element are visible (optimization?)
		//WorldLayers.LayerTypes.ActionFog,	// It is merged with Highlights layer
		WorldLayers.LayerTypes.VisibilityFog,
	]

	this.visualizeBattleTest = function () {
		var eworld = currentState.eworld;
		var gameState = eworld.extract(GameState);
		var leftUnit = lastCreated;
		var rightUnit = (selected) ? selected.CTile.placedObjects[0] : null;

		if (!leftUnit) {
			leftUnit = gameState.currentPlaceables.find(function (placeable) {
				return placeable.CUnit.name == 'TeslaTrooper';
			});
		}

		if (!rightUnit) {
			rightUnit = gameState.currentPlaceables.find(function (placeable) {
				return placeable.CUnit.name == 'TeslaTrooper';
			});
		}

		FightRenderingManager.visualizeBattle(eworld, leftUnit, rightUnit);
	}

	//
	// Visualize battle
	//
	this.visualizeBattle = function (eworld, attacker, defender) {
		// Order is important. Make shot before hiding the world.
		var renderer = eworld.extract(GameWorldRenderer);

		renderer.makeShot(m_$worldShot[0], shotLayers);
		renderer.hide();
		
		m_$worldShot.show();


		m_currentFight = {
			eworld: eworld,
			attacker: attacker,
			defender: defender,
			renderer: renderer,
			initialized: false,	// Prevents from problems while restarting on screen resize.
		};

		// World doesn't need to play animations in background.
		eworld.getSystem(AnimationSystem).pauseAnimations();

		m_fightWorld.getSystem(AnimationSystem).resumeAnimations();

		var battleSystem = eworld.extract(BattleSystem);
		var gameState = eworld.extract(GameState);


		// Choose screen sides
		var outcome = battleSystem.predictOutcome(attacker, defender);

		var leftStats = {
			unit: outcome.attacker,
			tile: outcome.attackerTile,
			strength: outcome.attackerStrength,
			health: outcome.attackerHealth,
			damageTaken: outcome.damageToAttacker,
			healthOutcome: outcome.attackerHealthOutcome,
		};
		var rightStats = {
			unit: outcome.defender,
			tile: outcome.defenderTile,
			strength: outcome.defenderStrength,
			health: outcome.defenderHealth,
			damageTaken: outcome.damageToDefender,
			healthOutcome: outcome.defenderHealthOutcome,
		};
		if (gameState.currentPlayer == defender.CPlayerData.player) {
			var swp = leftStats;
			leftStats = rightStats;
			rightStats = swp;
		}

		m_fightWorld.blackboard[FightRenderingBlackBoard.Battle.OUTCOME] = outcome;
		m_fightWorld.blackboard[FightRenderingBlackBoard.Battle.LEFT_UNIT] = leftStats.unit;
		m_fightWorld.blackboard[FightRenderingBlackBoard.Battle.RIGHT_UNIT] = rightStats.unit;
		m_fightWorld.blackboard[FightRenderingBlackBoard.Battle.LEFT_STATS] = leftStats;
		m_fightWorld.blackboard[FightRenderingBlackBoard.Battle.RIGHT_STATS] = rightStats;


		m_$FightScreenContainer.fadeIn('fast', initializeFight);
	};

	var initializeFight = function () {
		
		// Restarting or restarted.
		if (m_currentFight == null || m_currentFight.initialized)
			return;

		m_fightWorld.trigger(FightRenderingEvents.Fight.INITIALIZE);

		m_currentFight.initialized = true;

		//setTimeout(uninitializeFight, 1000 * 5);
	}

	var uninitializeFight = function () {

		if (m_currentFight.initialized)
			m_fightWorld.trigger(FightRenderingEvents.Fight.UNINITIALIZE);

		m_currentFight.eworld.getSystem(AnimationSystem).resumeAnimations();

		m_fightWorld.getSystem(AnimationSystem).pauseAnimations();

		m_currentFight.renderer.show();

		m_currentFight = null;

		m_$FightScreenContainer.hide();
		m_$worldShot.hide();

		// Clear shot.
		m_$worldShot.attr('width', 0);
		m_$worldShot.attr('height', 0);
	}

	var restartCurrentFight = function () {
		if (Utils.assert(m_currentFight))
			return;

		// After uninitialize, will be set to null.
		var currentFight = m_currentFight;

		m_$FightScreenContainer.stop(true, true);

		uninitializeFight();

		// Some time to redraw.
		setTimeout(function () {
			self.visualizeBattle(currentFight.eworld, currentFight.attacker, currentFight.defender);
		}, 100);
	}

	//
	// Resizing
	//
	var resizeTimeout;
	var onScreenResize = function (event) {
		
		clearTimeout(resizeTimeout);

		// Give some time for refresh to happen and allow sizes to get applied (as done in iScroll).
		resizeTimeout = setTimeout(function () {
			
			var worldWidth = m_renderer.zoomIn(m_$Screen.width());
			var worldHeight = m_renderer.zoomIn(m_$Screen.height());

			m_fightWorld.extract(FightRenderer).resize(worldWidth, worldHeight);

			self.FightFrame.top = m_renderer.extentHeight / 2 - self.FIGHT_FRAME_HEIGHT / 2;
			self.FightFrame.bottom = m_renderer.extentHeight / 2 + self.FIGHT_FRAME_HEIGHT / 2;
			self.FightFrame.left = m_renderer.extentWidth / 2 - self.FIGHT_FRAME_WIDTH_HALF;
			self.FightFrame.right = m_renderer.extentWidth / 2 + self.FIGHT_FRAME_WIDTH_HALF;
			self.FightFrame.leftHalf = self.FightFrame.left + FightRenderingManager.FIGHT_FRAME_WIDTH_HALF / 2;
			self.FightFrame.rightHalf = self.FightFrame.right - FightRenderingManager.FIGHT_FRAME_WIDTH_HALF / 2;

			m_$FightFrame.css({
				top: m_renderer.zoomBack(self.FightFrame.top),
				left: m_renderer.zoomBack(self.FightFrame.left),
				width: m_renderer.zoomBack(self.FightFrame.width),
				height: m_renderer.zoomBack(self.FightFrame.height),
			});

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
	subscriber.subscribe($('#FightScreenRestart')[0], 'click', restartCurrentFight);
	subscriber.subscribe($('#FightScreenQuit')[0], 'click', uninitializeFight);


	var initialize = function () {

		m_fightWorld = new ECS.EntityWorld();

		m_fightWorld.addSystem(m_fightWorld.store(UtilsSystem, new UtilsSystem()));

		m_renderer = m_fightWorld.store(FightRenderer, FightRenderer.Build(m_$FightScreen[0], m_fightWorld));
		onScreenResize(null);

		m_fightWorld.addSystem(new AnimationSystem(m_renderer));
		m_fightWorld.addSystem(new LayersUpdateSystem(m_renderer, FightRenderer.LayerTypes));
		m_fightWorld.addSystem(new FightControllerSystem(m_renderer));
		m_fightWorld.addSystem(new FightTilesRenderingSystem(m_renderer));
		m_fightWorld.addSystem(new FightUnitsRenderingSystem(m_renderer));
		m_fightWorld.addSystem(new FightUnitsRenderingEffectsSystem(m_renderer));
		m_fightWorld.addSystem(new FightUnitsAnimationsController());
		m_fightWorld.addSystem(new FightPortraitsController(m_renderer));
		m_fightWorld.addSystem(new FightUnitStatsController(m_renderer));
	}

	initialize();

};
