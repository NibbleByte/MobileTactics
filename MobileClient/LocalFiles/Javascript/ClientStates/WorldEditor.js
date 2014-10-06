//===============================================
// WorldEditor
// Create a world editor client state.
//===============================================
"use strict";

ClientStateManager.registerState(ClientStateManager.types.WorldEditor, new function () {
	
	var m_$GameWorldMap = $('#GameWorldMapEditor').hide();
	var m_$ToolbarContainer = $('#ToolbarContainerEditor').hide();

	var m_clientState = null;

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

		// Utils function.
		var fillEmptyTerrain = function (eworld, world, rows) {
			var tile;

			for(var i = 0; i < rows; ++i) {
				for(var j = Math.ceil(i / 2); j < rows + i / 2; ++j) {
			
					tile = GameWorld.createTileUnmanaged(GameWorldTerrainType.None, i, j);
			
					eworld.addUnmanagedEntity(tile);
				}
			}
		}

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
		m_clientState.world = world;
	

		//
		// Rendering Systems
		//

		var worldRenderer = new GameWorldRenderer(m_$GameWorldMap[0], eworld);
	
		eworld.addSystem(new TileRenderingSystem(worldRenderer));
		eworld.addSystem(new UnitRenderingSystem(worldRenderer));
		eworld.addSystem(new TileStructureRenderingSystem(worldRenderer));
		eworld.addSystem(new AnimationSystem(worldRenderer));
		eworld.addSystem(new LayersUpdateSystem(worldRenderer));

		m_clientState.worldRenderer = worldRenderer;


		//
		// Initialize stuff
		//
		var m_eworld = m_clientState.eworld;


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

				var ROWS = 10;
				fillEmptyTerrain(m_eworld, m_clientState.world, ROWS);

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