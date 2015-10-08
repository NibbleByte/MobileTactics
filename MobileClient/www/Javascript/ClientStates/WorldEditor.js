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

				// Uninitialize anything old
				m_clientState.world.clearTiles();

				if (m_clientState.playersData)	Utils.invalidate(m_clientState.playersData);
				if (m_clientState.gameState)	Utils.invalidate(m_clientState.gameState);


				// Initialize new data
				m_clientState.playersData = new PlayersData(m_eworld);
				m_eworld.store(PlayersData, m_clientState.playersData);
	
				m_clientState.gameState = new GameState();
				m_clientState.editorState = new EditorState();
				m_eworld.store(GameState, m_clientState.gameState);
				m_eworld.store(EditorState, m_clientState.editorState);
				
				m_eworld.blackboard[EngineBlackBoard.Serialization.IS_LOADING] = true;
				
				m_eworld.triggerAsync(EngineEvents.General.GAME_LOADING);

				m_clientState.playersData.addPlayer('Pl1', Player.Types.Human, Player.Races.Empire, PlayerColors[0]);
				m_clientState.playersData.addPlayer('Pl2', Player.Types.Human, Player.Races.Empire, PlayerColors[1]);
				m_clientState.playersData.addPlayer('Pl3', Player.Types.Human, Player.Races.Empire, PlayerColors[2]);
				m_clientState.playersData.addPlayer('Pl4', Player.Types.Human, Player.Races.Empire, PlayerColors[3]);

				m_clientState.editorController.setWorldSize(true, DEFAULT_ROWS, DEFAULT_COLUMNS);

				var failReasons = [];
				m_eworld.trigger(EngineEvents.General.GAME_VALIDATE, failReasons);
				if (failReasons.length > 0) {
					m_eworld.trigger(EngineEvents.General.GAME_VALIDATION_FAILED, failReasons);
				}

				m_eworld.triggerAsync(EngineEvents.General.GAME_LOADED);

				m_eworld.blackboard[EngineBlackBoard.Serialization.IS_LOADING] = false;

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
			for(var i = 0; i < m_clientState.playersData.players.length; ++i) {
				var player = m_clientState.playersData.players[i];

				m_clientState.playersData.setIsPlaying(player, usedPlayers[player.playerId]);
			}


		
			var fullGameState = {
					gameState: m_clientState.gameState,
					playersData: m_clientState.playersData,
					editorState: m_clientState.editorState,
					world: entities,
			};
			m_clientState.savedGame = Serialization.serialize(fullGameState, true, true);
			
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
			
						m_clientState.world.clearTiles();
		
						Utils.invalidate(m_clientState.playersData);
						Utils.invalidate(m_clientState.gameState);
		
						var allObjects = [];
		
						var fullGameState = Serialization.deserialize(data, allObjects);
		
						m_clientState.gameState = fullGameState.gameState;
						m_clientState.editorState = fullGameState.editorState || new EditorState();
						m_clientState.playersData = fullGameState.playersData;
						m_eworld.store(PlayersData, m_clientState.playersData);
						m_eworld.store(GameState, m_clientState.gameState);
						m_eworld.store(EditorState, m_clientState.editorState);

						m_eworld.blackboard[EngineBlackBoard.Serialization.IS_LOADING] = true;
		
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

						var failReasons = [];
						m_eworld.trigger(EngineEvents.General.GAME_VALIDATE, failReasons);
						if (failReasons.length > 0) {
							m_eworld.trigger(EngineEvents.General.GAME_VALIDATION_FAILED, failReasons);
						}

						m_eworld.triggerAsync(EngineEvents.General.GAME_LOADED);

						m_eworld.blackboard[EngineBlackBoard.Serialization.IS_LOADING] = false;

						// Fill out the rest with empty tiles.
						var rows = Math.max(m_renderer.getRenderedRows(), DEFAULT_ROWS);
						var columns = Math.max(m_renderer.getRenderedColumns(), DEFAULT_COLUMNS);

						if (!m_clientState.editorState.mapLockedSizes) {
							rows += 2;
							columns += 2;
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

		m_clientState.eworldSB.subscribe(EngineEvents.General.GAME_VALIDATION_FAILED, onValidationFailed);
		m_clientState.eworldSB.subscribe(EngineEvents.General.GAME_LOADED, onGameLoaded);

		//
		// Initialize
		//
		onBtnRestart();

		m_subscriber.subscribe($('#BtnSaveEditor'), 'click', onBtnSave);
		m_subscriber.subscribe(m_$BtnLoad, 'change', onBtnLoad);

		return m_clientState;
	}
});