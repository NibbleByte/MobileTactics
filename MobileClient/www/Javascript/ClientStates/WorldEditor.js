//===============================================
// WorldEditor
// Create a world editor client state.
//===============================================
"use strict";

ClientStateManager.registerState(ClientStateManager.types.WorldEditor, new function () {
	
	var DEFAULT_ROWS = 5, DEFAULT_COLUMNS = 7;

	var m_$GameWorldMap = $('#GameWorldMapEditor').hide();
	var m_$ToolbarContainer = $('#ToolbarContainerEditor').hide();
	var m_$BtnLoad = $('#BtnLoadEditor');

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
			m_clientState.gameMetaData = null;
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
			gameMetaData: null,
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
		eworld.addSystem(new UnitsSystem(world));
		m_clientState.world = world;

		//
		// Rendering Systems
		//

		var worldRenderer = GameWorldRenderer.Build(m_$GameWorldMap[0], eworld, {
			fadeScrollbars: false,
			interactiveScrollbars: true,
		});

		eworld.store(GameWorldRenderer, worldRenderer);
	
		eworld.addSystem(new TileRenderingSystem(worldRenderer, false, false, false));
		eworld.addSystem(new UnitRenderingSystem(worldRenderer));
		eworld.addSystem(new TileStructureRenderingSystem(worldRenderer));
		eworld.addSystem(new AnimationSystem(worldRenderer));
		eworld.addSystem(new AnimationSystemScrollOptimizer(worldRenderer, m_clientState.eworld.getSystem(AnimationSystem)));
		eworld.addSystem(new LayersUpdateSystem(worldRenderer, WorldLayers.LayerTypes));
		eworld.addSystem(new CanvasInstancesUpdateSystem(worldRenderer, WorldLayers.LayerTypes));
		eworld.addSystem(new IdleAnimationsSystem(worldRenderer));	// Just for fun

		m_clientState.worldRenderer = worldRenderer;

		m_clientState.editorController = eworld.addSystem(new EditorController(world, worldRenderer));
		eworld.addSystem(new EditorUnitPropertiesController());
		eworld.addSystem(new EditorGamePropertiesController(worldRenderer));
		eworld.addSystem(new EditorPlayersPropertiesController());


		//
		// Initialize stuff
		//
		var m_eworld = m_clientState.eworld;
		var m_world = m_clientState.world;
		var m_renderer = m_clientState.worldRenderer;

		var onBtnRestart = function () {
			m_loadingScreen.show();

			setTimeout(function () {
				
				var gameLoader = new GameLoader(m_clientState, m_eworld);

				gameLoader.create(function () {
					m_clientState.editorState = new EditorState();
					m_eworld.store(EditorState, m_clientState.editorState);
				},

				function () {
					for(var i = 0; i < m_clientState.editorState.playersCount; ++i) {
						m_clientState.playersData.addPlayer();
					}

					m_clientState.editorController.setWorldSize(true, DEFAULT_ROWS, DEFAULT_COLUMNS);
				});

				m_renderer.refresh();

				m_lastFilename = 'Untitled.json';

				m_eworld.triggerAsync(RenderEvents.Layers.REFRESH_ALL);

			}, 200);
		}

		var onBtnSave = function(event) {

			var entities = m_eworld.getEntities().clone();
			var usedPlayers = {};

			// Remove empty tiles
			for(var i = 0; i < entities.length; ++i) {
				var entity = entities[i]; 

				if (entity.CTileTerrain && entity.CTileTerrain.type == GameWorldTerrainType.None) {
					entities.removeAt(i);
					--i;
					continue;
				}

				if (entity.CTileOwner && entity.CTileOwner.owner != null) {
					usedPlayers[entity.CTileOwner.owner.playerId] = true;
				}
				if (entity.CPlayerData && entity.CPlayerData.player != null) {
					usedPlayers[entity.CPlayerData.player.playerId] = true;
				}
			}

			// Unused players...
			var usedPlayersToSerialize = [];
			var allPlayers = m_clientState.playersData.players;
			for(var i = 0; i < m_clientState.playersData.players.length; ++i) {
				var player = m_clientState.playersData.players[i];

				if (usedPlayers[player.playerId])
					usedPlayersToSerialize.push(player);
			}

			// Swap with array of only used players.
			m_clientState.playersData.players = usedPlayersToSerialize;

			m_clientState.gameMetaData.lastModified = Date.now();
		
			var fullGameState = {
					gameState: m_clientState.gameState,
					gameMetaData: m_clientState.gameMetaData,
					playersData: m_clientState.playersData,
					editorState: m_clientState.editorState,
					world: entities,
			};
			m_clientState.savedGame = Serialization.serialize(fullGameState, true, true);

			// Revert back players
			m_clientState.playersData.players = allPlayers;
			
			var blob = new Blob([m_clientState.savedGame], {type: "text/plain;charset=utf-8"});
			saveAs(blob, m_lastFilename);
		}

		var onBtnLoad = function(event) {

			// Check for the various File API support.
			if (window.File && window.FileReader && window.FileList && window.Blob) {

				if (event.target.files.length == 0)
					return;

				var file = event.target.files[0];

				var reader = new BrowserAPI.FileReader();
				reader.onload = function (event) {
					var data = event.target.result;

					m_loadingScreen.show();

					setTimeout(function () {
						
						var gameLoader = new GameLoader(m_clientState, m_eworld);

						gameLoader.load(data, function (fullGameState) {
							m_clientState.editorState = fullGameState.editorState || new EditorState();
							m_eworld.store(EditorState, m_clientState.editorState);
						});


						// Fill out the rest with empty tiles.
						var rows = Math.max(m_renderer.getRenderedRows(), DEFAULT_ROWS);
						var columns = Math.max(m_renderer.getRenderedColumns(), DEFAULT_COLUMNS);

						if (!m_clientState.editorState.mapLockedSizes) {
							rows += 2;
							columns += 2;
						}

						m_clientState.editorState.playersCount = m_clientState.editorState.playersCount || m_clientState.playersData.players.length;

						while(m_clientState.playersData.players.length < m_clientState.editorState.playersCount) {
							m_clientState.playersData.addPlayer();
						}
						
						m_clientState.editorController.setWorldSize(false, rows, columns);

						m_renderer.refresh();

						m_lastFilename = file.name;

						// Clear the value of the input, so it can load the same file again if needed.
						m_$BtnLoad.val('');

						m_eworld.triggerAsync(RenderEvents.Layers.REFRESH_ALL);

					}, 200);
				}

				reader.readAsText(file);

			} else {
				alert('The File APIs are not fully supported in this browser.');
			}
		}

		var onGameLoaded = function () {
			m_loadingScreen.hide();
		}

		var onValidationFailed = function (failedReasons) {

			console.error('Game validation failed:');

			for(var i = 0; i < failedReasons.length; ++i) {
				console.error('> ' + failedReasons[i]);
			}
		}


		var onBackButton = function () {
			if (Application.tryCancelDialogs())
				return;

			ClientStateManager.changeState(ClientStateManager.types.MenuScreen);
		}

		m_clientState.eworldSB.subscribe(EngineEvents.General.GAME_VALIDATION_FAILED, onValidationFailed);
		m_clientState.eworldSB.subscribe(EngineEvents.General.GAME_LOADED, onGameLoaded);

		//
		// Initialize
		//
		onBtnRestart();

		m_subscriber.subscribe($('#BtnSaveEditor'), 'click', onBtnSave);
		m_subscriber.subscribe(m_$BtnLoad, 'change', onBtnLoad);

		m_subscriber.subscribe(document, 'backbutton', onBackButton);

		return m_clientState;
	}
});