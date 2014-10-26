//===============================================
// WorldEditor
// Create a world editor client state.
//===============================================
"use strict";

ClientStateManager.registerState(ClientStateManager.types.WorldEditor, new function () {
	
	var m_$GameWorldMap = $('#GameWorldMapEditor').hide();
	var m_$ToolbarContainer = $('#ToolbarContainerEditor').hide();

	var m_clientState = null;

	// DEBUG: scrollable toolbar
	var m_toolbarScroller;
	setTimeout(function () {
		m_toolbarScroller = new IScroll(m_$ToolbarContainer[0], {
			keyBindings: false,
			mouseWheel: false,
			scrollX: true,
			scrollY: false,
			scrollbars: true,
			fadeScrollbars: true,
			bounce: false,
		});
	}, 250);

	this.cleanUp = function () {
		m_$GameWorldMap.hide();
		m_$ToolbarContainer.hide();

		if (m_clientState) {
			m_clientState.gameState = null;
			m_clientState.playersData = null;

			m_clientState.eworldSB.unsubscribeAll();
			m_clientState.executor = null;
			m_clientState.eworld.destroy();
			m_clientState.worldRenderer.destroy();
			m_clientState = null;
		}
	},

	this.setup = function (m_loadingScreen) {

		m_clientState = {
			playersData: null,
			gameState: null,
		};

		m_$GameWorldMap.show();
		m_$ToolbarContainer.show();

		//
		// World
		//
		var eworld = new ECS.EntityWorld();
		var eworldSB = eworld.createSubscriber();

		m_clientState.eworld = eworld;
		m_clientState.eworldSB = eworldSB;
	
		eworld.addSystem(eworld.store(UtilsSystem, new UtilsSystem()));

		//
		// World systems
		//
		var world = new GameWorld();
		eworld.addSystem(world);
		eworld.store(GameWorld, world);
		eworld.addSystem(new UnitsSystem());
		m_clientState.world = world;

		//
		// Rendering Systems
		//

		var worldRenderer = new GameWorldRenderer(m_$GameWorldMap[0], eworld, {
			fadeScrollbars: false,
			interactiveScrollbars: true,
		});
	
		eworld.addSystem(new TileRenderingSystem(worldRenderer, false, false, false));
		eworld.addSystem(new UnitRenderingSystem(worldRenderer));
		eworld.addSystem(new TileStructureRenderingSystem(worldRenderer));
		eworld.addSystem(new AnimationSystem(worldRenderer));
		eworld.addSystem(new LayersUpdateSystem(worldRenderer));
		eworld.addSystem(new IdleAnimationsSystem(worldRenderer));	// Just for fun

		m_clientState.worldRenderer = worldRenderer;

		m_clientState.editorController = eworld.addSystem(new EditorController(world, worldRenderer));


		//
		// Initialize stuff
		//
		var m_eworld = m_clientState.eworld;
		var m_world = m_clientState.world;
		var m_renderer = m_clientState.worldRenderer;


		var onBtnRestart = function () {
			m_loadingScreen.show();

			setTimeout(function () {

				// Uninitialize anything old
				m_clientState.world.clearTiles();

				if (m_clientState.playersData)	Utils.invalidate(m_clientState.playersData);
				if (m_clientState.gameState)	Utils.invalidate(m_clientState.gameState);


				// Initialize new data
				m_clientState.playersData = new PlayersData(m_eworld);
				m_eworld.store(PlayersData, m_clientState.playersData);
				m_clientState.playersData.addPlayer('Pl1', Player.Types.Human, Player.Races.Humans, 60);
				m_clientState.playersData.addPlayer('Pl2', Player.Types.Human, Player.Races.Humans, 120);
				m_clientState.playersData.addPlayer('Pl3', Player.Types.Human, Player.Races.Humans, 175);
				m_clientState.playersData.addPlayer('Pl4', Player.Types.Human, Player.Races.Humans, 220);
	
				m_clientState.gameState = new GameState();
				m_eworld.store(GameState, m_clientState.gameState);
			
				m_eworld.triggerAsync(EngineEvents.General.GAME_LOADING);

				var ROWS = 5, COLUMNS = 7;
				m_clientState.editorController.setWorldSize(true, ROWS, COLUMNS);

				m_eworld.triggerAsync(EngineEvents.General.GAME_LOADED);


				m_clientState.playersData.stopPlaying(m_clientState.playersData.getPlayer(2));
				m_clientState.playersData.stopPlaying(m_clientState.playersData.getPlayer(3));

			}, 200);
		}

		var onGameLoaded = function (event) {
			m_loadingScreen.hide();
		}

		m_clientState.eworldSB.subscribe(EngineEvents.General.GAME_LOADED, onGameLoaded);

		//
		// Initialize
		//
		onBtnRestart();

		return m_clientState;
	}
});