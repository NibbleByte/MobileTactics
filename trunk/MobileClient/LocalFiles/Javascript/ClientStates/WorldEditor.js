//===============================================
// WorldEditor
// Create a world editor client state.
//===============================================
"use strict";

ClientStateManager.registerState(ClientStateManager.types.WorldEditor, new function () {
	
	var DEFAULT_ROWS = 5, DEFAULT_COLUMNS = 7;

	var m_$GameWorldMap = $('#GameWorldMapEditor').hide();
	var m_$ToolbarContainer = $('#ToolbarContainerEditor').hide();

	var m_subscriber = new DOMSubscriber();
	var m_clientState = null;

	var m_lastFilename = '';

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

		m_subscriber.unsubscribeAll();

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

		var worldRenderer = GameWorldRenderer.Build(m_$GameWorldMap[0], eworld, {
			fadeScrollbars: false,
			interactiveScrollbars: true,
		});
	
		eworld.addSystem(new TileRenderingSystem(worldRenderer, false, false, false));
		eworld.addSystem(new UnitRenderingSystem(worldRenderer));
		eworld.addSystem(new TileStructureRenderingSystem(worldRenderer));
		eworld.addSystem(new AnimationSystem(worldRenderer));
		eworld.addSystem(new LayersUpdateSystem(worldRenderer, WorldLayers.LayerTypes));
		eworld.addSystem(new IdleAnimationsSystem(worldRenderer));	// Just for fun

		m_clientState.worldRenderer = worldRenderer;

		m_clientState.editorController = eworld.addSystem(new EditorController(world, worldRenderer));
		eworld.addSystem(new EditorUnitPropertiesController());
		eworld.addSystem(new EditorGamePropertiesController(m_clientState.editorController, worldRenderer));


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

				m_clientState.editorController.setWorldSize(true, DEFAULT_ROWS, DEFAULT_COLUMNS);

				m_eworld.triggerAsync(EngineEvents.General.GAME_LOADED);

				m_lastFilename = 'Untitled.json';

				m_eworld.triggerAsync(RenderEvents.Layers.REFRESH_ALL);

			}, 200);
		}

		var onBtnSave = function(event) {

			var entities = m_eworld.getEntities().clone();

			// Remove empty tiles
			for(var i = 0; i < entities.length; ++i) {
				if (entities[i].CTileTerrain && entities[i].CTileTerrain.type == GameWorldTerrainType.None) {
					entities.removeAt(i);
					--i;
				}
			}
		
			var fullGameState = {
					gameState: m_clientState.gameState,
					playersData: m_clientState.playersData,
					world: entities,
			};
			m_clientState.savedGame = Serialization.serialize(fullGameState, true);
			
			var blob = new Blob([m_clientState.savedGame], {type: "text/plain;charset=utf-8"});
			saveAs(blob, m_lastFilename);
		}

		var onBtnLoad = function(event) {

			// Check for the various File API support.
			if (window.File && window.FileReader && window.FileList && window.Blob) {

				if (event.target.files.length == 0)
					return;

				var file = event.target.files[0];

				if (file.type != 'text/plain')
					return;

				var reader = new BrowserAPI.FileReader();
				reader.onload = function (event) {
					var data = event.target.result;

					m_loadingScreen.show();

					setTimeout(function () {
			
						m_clientState.world.clearTiles();
		
						Utils.invalidate(m_clientState.playersData);
						Utils.invalidate(m_clientState.gameState);
		
						var allObjects = [];
		
						var fullGameState = Serialization.deserialize(data, allObjects);
		
						m_clientState.gameState = fullGameState.gameState;
						m_clientState.playersData = fullGameState.playersData;
						m_eworld.store(PlayersData, m_clientState.playersData);
						m_eworld.store(GameState, m_clientState.gameState);
		
						m_eworld.triggerAsync(EngineEvents.General.GAME_LOADING);
		
						for(var i = 0; i < allObjects.length; ++i) {
							if (allObjects[i].onDeserialize)
								allObjects[i].onDeserialize(m_eworld);
						}
		
						var entities = fullGameState.world;
						for(var i = 0; i < entities.length; ++i) {
			
							UnitsFactory.postDeserialize(entities[i]);
							m_eworld.addUnmanagedEntity(entities[i]);
						}
		
						for(var i = 0; i < entities.length; ++i) {
							m_eworld.trigger(EngineEvents.Serialization.ENTITY_DESERIALIZED, entities[i]);
						}

						m_eworld.triggerAsync(EngineEvents.General.GAME_LOADED);

						// Fill out the rest with empty tiles.
						var rows = Math.max(m_renderer.getRenderedRows() + 2, DEFAULT_ROWS);
						var columns = Math.max(m_renderer.getRenderedColumns() + 2, DEFAULT_COLUMNS);
						
						m_clientState.editorController.setWorldSize(false, rows, columns);

						m_lastFilename = file.name;
						$('#BtnLoadEditor').val('');

						m_eworld.triggerAsync(RenderEvents.Layers.REFRESH_ALL);

					}, 200);
				}

				reader.readAsText(file);

			} else {
				alert('The File APIs are not fully supported in this browser.');
			}
		}

		var onGameLoaded = function (event) {
			m_loadingScreen.hide();
		}

		m_clientState.eworldSB.subscribe(EngineEvents.General.GAME_LOADED, onGameLoaded);

		//
		// Initialize
		//
		onBtnRestart();

		m_subscriber.subscribe($('#BtnSaveEditor'), 'click', onBtnSave);
		m_subscriber.subscribe($('#BtnLoadEditor'), 'change', onBtnLoad);

		return m_clientState;
	}
});