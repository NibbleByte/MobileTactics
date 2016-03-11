//===============================================
// TestGame
// Create a test game client state.
//===============================================
"use strict";

ClientStateManager.registerState(ClientStateManager.types.TestGame, new function () {
	var self = this;

	var m_$GameWorldMap = $('#GameWorldMap').hide();
	var m_$ActionMenu = $('#ActionMenu').hide();
	var m_$ToolbarContainer = $('#ToolbarContainer').hide();
	var m_$ToolbarMore = $('#ToolbarMore').hide();

	var m_$BtnSave = $('#BtnSave');
	var m_$BtnLoad = $('#BtnLoad');
	var m_$BtnRemoveTile = $('#BtnRemoveTile');
	var m_$BtnRestart = $('#BtnRestart');
	var m_$BtnUndo= $('#BtnUndo');
	var m_$BtnPlayer = $('#BtnPlayer');
	var m_$BtnPlayerType = $('#BtnPlayerType');
	var m_$BtnDebug = $('#BtnDebug');
	var m_$BtnBrowse = $('#BtnBrowse');
	var m_$BtnAddress = $('#BtnAddress');

	var m_$TbBrowseAddress = $('#TbBrowseAddress');

	var m_subscriber = new DOMSubscriber();

	var m_fogOfWar = true; 
	
	if (ClientUtils.urlParams['NoFog']) {
		m_fogOfWar = false;
	}


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


	var m_clientState = null;

	// Utils function.
	var fillTerrainPattern = function (eworld, world, playersData, rows, columns) {
		var tile;
	
		var count = 0;

		for(var i = 0; i < rows; ++i) {
			for(var j = Math.ceil(i / 2); j < columns + i / 2; ++j) {
			
				tile = GameWorld.createTileUnmanaged(GameWorldTerrainType.Plains, i, j);
				if (i % 3 <= 1 && j % 4 >= 2) {
					tile.CTileTerrain.type = GameWorldTerrainType.Plains;
				}
				if (i % 7 <= 2 && j % 5 <= 1) {
					tile.CTileTerrain.type = GameWorldTerrainType.Mountain;
				}
				if (i % 5 <= 1 && j % 4 <= 1) {
					tile.CTileTerrain.type = GameWorldTerrainType.Forest;
				}
				if (i >= rows - 2 && rows > 4) {
					tile.CTileTerrain.type = GameWorldTerrainType.Water;
				}
			
				var playersData = eworld.extract(PlayersData);
				if (i == Math.floor(rows / 4) || i == Math.floor(rows / 3) || i == Math.floor(rows / 2)) {
					if (j == i || j == rows - i) {
						tile.CTileTerrain.type = GameWorldTerrainType.Minerals;
						tile.addComponent(CTileOwner);

						if (count % 3 == 0) {
							tile.CTileOwner.owner = playersData.players[count % 2];
						}

						if (count == 1) {
							tile.CTileOwner.owner = playersData.players[1];
						}

						count++;
					}
				}
				

				//
				// Add basic structures
				//

				// Player 0
				if (i == 3 && j == 2) {
					tile.addComponentSafe(CTileOwner);
					tile.CTileTerrain.type = GameWorldTerrainType.HQ;
					tile.CTileOwner.owner = playersData.players[0];
				}
				
				if (i == 4 && j == 3) {
					tile.addComponentSafe(CTileOwner);
					tile.CTileTerrain.type = GameWorldTerrainType.Factory;
					tile.CTileOwner.owner = playersData.players[0];
				}

				if (i == 1 && j == 2) {
					tile.addComponentSafe(CTileOwner);
					tile.CTileTerrain.type = GameWorldTerrainType.Factory;
					tile.CTileOwner.owner = playersData.players[0];
				}

				if (i == 2 && j == 4) {
					tile.addComponentSafe(CTileOwner);
					tile.CTileTerrain.type = GameWorldTerrainType.Minerals;
					tile.CTileOwner.owner = playersData.players[0];
				}

				// Player 1
				if (i == 3 && j == 10) {
					tile.addComponentSafe(CTileOwner);
					tile.CTileTerrain.type = GameWorldTerrainType.HQ;
					tile.CTileOwner.owner = playersData.players[1];
				}
				
				if (i == 5 && j == 10) {
					tile.addComponentSafe(CTileOwner);
					tile.CTileTerrain.type = GameWorldTerrainType.Factory;
					tile.CTileOwner.owner = playersData.players[1];
				}

				if (i == 1 && j == 8) {
					tile.addComponentSafe(CTileOwner);
					tile.CTileTerrain.type = GameWorldTerrainType.Factory;
					tile.CTileOwner.owner = playersData.players[1];
				}

				if (i == 3 && j == 9) {
					tile.addComponentSafe(CTileOwner);
					tile.CTileTerrain.type = GameWorldTerrainType.Minerals;
					tile.CTileOwner.owner = playersData.players[1];
				}

				// No one
				if (i == 6 && j == 7) {
					tile.addComponentSafe(CTileOwner);
					tile.CTileTerrain.type = GameWorldTerrainType.Minerals;
				}



				// Pick random skin
				tile.CTileTerrain.skin = (i + j * 3) % GameWorldTerrainSkin[tile.CTileTerrain.type].length;

				eworld.addUnmanagedEntity(tile);
			}
		}


		//
		// Add some testing units.
		//

		// Player 0
		tile = world.getTile(3, 4);
		if (tile) {
			var unit = UnitsFactory.createUnit(UnitsDefinitions[0].WarMiner, playersData.players[0]);
			eworld.addUnmanagedEntity(unit);
			world.place(unit, tile);
		}
		
		tile = world.getTile(1, 3);
		if (tile) {
			var unit = UnitsFactory.createUnit(UnitsDefinitions[0].RhinoTank, playersData.players[0]);
			eworld.addUnmanagedEntity(unit);
			world.place(unit, tile);
		}

		tile = world.getTile(5, 6);
		if (tile) {
			var unit = UnitsFactory.createUnit(UnitsDefinitions[0].TeslaTrooper, playersData.players[0]);
			eworld.addUnmanagedEntity(unit);
			world.place(unit, tile);
		}

		tile = world.getTile(6, 3);
		if (tile) {
			var unit = UnitsFactory.createUnit(UnitsDefinitions[0].RhinoTank, playersData.players[0]);
			eworld.addUnmanagedEntity(unit);
			world.place(unit, tile);
		}

		tile = world.getTile(6, 4);
		if (tile) {
			var unit = UnitsFactory.createUnit(UnitsDefinitions[2].Nibbler, playersData.players[0]);
			eworld.addUnmanagedEntity(unit);
			world.place(unit, tile);
		}


		// Player 1
		tile = world.getTile(2, 6);
		if (tile) {
			var unit = UnitsFactory.createUnit(UnitsDefinitions[0].WarMiner, playersData.players[1]);
			eworld.addUnmanagedEntity(unit);
			world.place(unit, tile);
		}
		
		tile = world.getTile(4, 8);
		if (tile) {
			var unit = UnitsFactory.createUnit(UnitsDefinitions[0].RhinoTank, playersData.players[1]);
			eworld.addUnmanagedEntity(unit);
			world.place(unit, tile);
		}

		tile = world.getTile(5, 8);
		if (tile) {
			var unit = UnitsFactory.createUnit(UnitsDefinitions[0].TeslaTrooper, playersData.players[1]);
			eworld.addUnmanagedEntity(unit);
			world.place(unit, tile);
		}

		tile = world.getTile(3, 9);
		if (tile) {
			var unit = UnitsFactory.createUnit(UnitsDefinitions[0].RhinoTank, playersData.players[1]);
			eworld.addUnmanagedEntity(unit);
			world.place(unit, tile);
		}
	}

	this.cleanUp = function () {

		m_$GameWorldMap.hide();
		m_$ActionMenu.hide();
		m_$ToolbarContainer.hide();

		m_subscriber.unsubscribeAll();

		if (m_clientState) {
			m_clientState.gameState = null;
			m_clientState.playersData = null;
			m_clientState.gameMetaData = null;

			m_clientState.eworldSB.unsubscribeAll();
			m_clientState.executor = null;
			m_clientState.eworld.destroy();
			m_clientState.worldRenderer.destroy();
			m_clientState = null;
		}
	};

	this.setup = function (m_loadingScreen, m_initData) {

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
		var m_eworld = new ECS.EntityWorld();
		m_clientState.eworldSB = m_eworld.createSubscriber();

		m_clientState.eworld = m_eworld;
	
		m_eworld.addSystem(m_eworld.store(UtilsSystem, new UtilsSystem()));
		m_eworld.addSystem(m_eworld.store(SynchronizationSystem, new SynchronizationSystem()));

		//
		// World systems
		//
		var world = new GameWorld();
		m_eworld.addSystem(world);
		m_eworld.store(GameWorld, world);
		m_clientState.world = world;
	
		//
		// Gameplay Systems
		//
		var effects = new EffectsSystem();
		m_eworld.addSystem(m_eworld.store(BattleSystem, new BattleSystem(world)));
		m_eworld.addSystem(new UnitsSystem());
		m_eworld.addSystem(effects);
		m_eworld.addSystem(new GameStateSystem());
		m_eworld.addSystem(new ResourcesSystem());
		m_eworld.addSystem(new TileStructuresSystem());	// Before TileVisibilitySystem, because structures also define visibility
		m_eworld.addSystem(new TileCapturingSystem());	// After TileStructuresSystem
		m_eworld.addSystem(new TileVisibilitySystem(world));
	
		var executor = m_eworld.store(GameExecutor, new GameExecutor(m_eworld, world));
	
	
		var playerController = new PlayerController(executor);
		m_eworld.addSystem(new CommonController(executor));
		m_eworld.addSystem(playerController);
	
		m_clientState.effects = effects;
		m_clientState.executor = executor;
		m_clientState.playerController = playerController;


		//
		// Rendering Systems
		//

		var worldRenderer = GameWorldRenderer.Build(m_$GameWorldMap[0], m_eworld);
		m_eworld.store(GameWorldRenderer, worldRenderer);
	
		m_eworld.addSystem(new TileRenderingSystem(worldRenderer, true, true, true));
		m_eworld.addSystem(new UnitRenderingSystem(worldRenderer));
		m_eworld.addSystem(new TileStructureRenderingSystem(worldRenderer));
		m_eworld.addSystem(new ControllerRenderingSystem(worldRenderer, $('#LbCredits')));
		m_eworld.addSystem(new AnimationSystem(worldRenderer));
		m_eworld.addSystem(new AnimationSystemScrollOptimizer(worldRenderer, m_eworld.getSystem(AnimationSystem)));
		m_eworld.addSystem(new LayersUpdateSystem(worldRenderer, WorldLayers.LayerTypes));
		m_eworld.addSystem(new CanvasInstancesUpdateSystem(worldRenderer, WorldLayers.LayerTypes));
		m_eworld.addSystem(new IdleAnimationsSystem(worldRenderer));
		m_eworld.addSystem(new ActionsRenderingSystem(executor, m_eworld.extract(BattleSystem)));
		m_eworld.addSystem(new ActionFogRenderingSystem(world));
		m_eworld.addSystem(new VisibilityFogRenderingSystem(world, m_eworld.getSystem(TileVisibilitySystem)));
	
		m_eworld.addSystem(new ActionsMenuController(m_$ActionMenu[0]));
		m_eworld.addSystem(new FloatingTextsSystem(worldRenderer));

		m_eworld.addSystem(new DebugTilesRenderingSystem(worldRenderer));

		m_clientState.worldRenderer = worldRenderer;


		//
		// AI Systems
		//
		m_eworld.addSystem(new AISimulationSystem(m_eworld));
		m_eworld.addSystem(new AITaskAttackingSystem(world, executor, m_eworld.extract(BattleSystem)));
		m_eworld.addSystem(new AITaskExploreSystem(world, executor));
		m_eworld.addSystem(new AITaskHealSystem(world, executor));
		m_eworld.addSystem(new AITaskCaptureSystem(world, executor));
		m_eworld.addSystem(new AITaskBuyingSystem(world, executor));
	
		m_eworld.addSystem(new AIController(executor));
		m_eworld.addSystem(new AIControllerUI(executor, m_eworld.getSystem(AIController)));


		//
		// Handlers
		//
		var onBtnSave = function () {
			var entities = m_eworld.getEntities();

			m_clientState.gameMetaData.lastPlayed = Date.now();
		
			var fullGameState = {
					gameState: m_clientState.gameState,
					gameMetaData: m_clientState.gameMetaData,
					playersData: m_clientState.playersData,
					world: entities,
			};
			m_clientState.savedGame = Serialization.serialize(fullGameState, true, true);

			if (MenuScreenState.selectedSaveName) {
				SavesStorage.saveGame(MenuScreenState.selectedSaveName, m_clientState.savedGame);
			}
		}
		
		var onBtnLoad = function (event, data) {
			
			if (!data)
				data = m_clientState.savedGame;

			if (!data)
				return;

			m_loadingScreen.show();

			setTimeout(function () {
			
				var gameLoader = new GameLoader(m_clientState, m_eworld);

				gameLoader.load(data, function () {

					m_clientState.gameState.fogOfWar = m_fogOfWar;

					// Up to 2 human players only (for now).
					for(var i = 2; i < m_clientState.playersData.players.length; ++i) {
						m_clientState.playersData.players[i].type = Player.Types.AI;
					}

				});

				// Avoid refreshing while loading.
				m_eworld.extract(GameWorldRenderer).refresh();

			}, 200);
		}

		m_clientState.loadMap = function (mapName) {
			m_loadingScreen.show();

			MapsStorage.loadMap(mapName, function (data) {
				onBtnLoad(event, data);
			}, function () {
				m_loadingScreen.hide();
			});

			m_$ToolbarMore.hide();
		}
	
		var onBtnRemoveTile = function () {
			// TODO: This uses debug feature that will be removed!
			if (selected)
				selected.destroy();
		}
	
		var onBtnRestart = function () {
			m_loadingScreen.show();

			setTimeout(function () {

				var gameLoader = new GameLoader(m_clientState, m_eworld);

				gameLoader.create(function () {

					m_clientState.gameState.fogOfWar = m_fogOfWar;

					m_clientState.playersData.addPlayer('Pl1', Player.Types.Human, Player.Races.Empire, PlayerColors[0]);
					m_clientState.playersData.addPlayer('Pl2', Player.Types.Human, Player.Races.JunkPeople, PlayerColors[1]);
					m_clientState.playersData.addPlayer('Pl3', Player.Types.Human, Player.Races.Developers, PlayerColors[2]);
					m_clientState.playersData.addPlayer('Pl4', Player.Types.Human, Player.Races.Developers, PlayerColors[3]);

				},

				function () {
					var ROWS = 10, COLUMNS = 10;
					fillTerrainPattern(m_eworld, m_clientState.world, m_clientState.playersData, ROWS, COLUMNS);
				});

				// Avoid refreshing while loading.
				m_eworld.extract(GameWorldRenderer).refresh();


				m_clientState.playersData.setIsPlaying(m_clientState.playersData.getPlayer(2), false);
				m_clientState.playersData.setIsPlaying(m_clientState.playersData.getPlayer(3), false);

			}, 200);
		}

		
		var onBtnUndo = function () {
			playerController.undoLastAction();
		}
	
		var onBtnPlayer = function () {
			m_eworld.trigger(GameplayEvents.GameState.END_TURN);
		}


		var m_playerAIToggled = null;
		var onBtnPlayerType = function () {

			if (!m_playerAIToggled) {
				m_playerAIToggled = m_clientState.gameState.currentPlayer;

				m_playerAIToggled.type = Player.Types.AI;
				m_eworld.trigger(AIEvents.Simulation.FORCE_START_SIMULATION);

				m_$BtnPlayerType.text('Clr AI');

			} else {
				m_playerAIToggled.type = Player.Types.Human;
				m_playerAIToggled = null;
				
				m_$BtnPlayerType.text('Set AI');
			}
		}
	
		var onTurnChanged = function () {
			var player = m_clientState.gameState.currentPlayer;

			if (player) {
				m_$BtnPlayer.text(player.name);
			} else {
				m_$BtnPlayer.text('N/a');
			}
		}
	
		var m_debugShown = false;
		var onBtnDebug = function () {
			
			m_debugShown = !m_debugShown;

			if (!m_debugShown) {
				m_eworld.trigger(RenderEvents.Debug.CLEAR_TILES);
				return;
			}

			
			var entities = m_eworld.getEntities();
		
			for(var i = 0; i < entities.length; ++i) {
				var entity = entities[i];
			
				var tile = entity.CTile;
				var rendering = entity.CTileRendering;
			
				if (!tile || !rendering)
					continue;
			

				var text = 'RC: ' + tile.row + ', ' + tile.column;
				text += '\nX: ' + parseInt(rendering.sprite.x);
				text += '\nY: ' + parseInt(rendering.sprite.y);

				if (tile.column % 2) 
					m_eworld.trigger(RenderEvents.Debug.TILE_DRAW_TEXT, entity, text);
				else
					m_eworld.trigger(RenderEvents.Debug.TILE_DRAW_TEXT, entity, text, 'Assets-Scaled/Render/Images/hex_bluesh.png');
			}
		}
	

		var onBtnBrowse = function () {
			var address = m_$TbBrowseAddress.val();
			if (address.indexOf('http://') == -1 && address.indexOf('https://') == -1) {
				address = 'http://' + address;
			}

			window.location.href = address;
		}

		// HACK: This is workaround, as iScroller doesn't let the input control to be clicked.
		var onBtnAddress = function () {
			m_$TbBrowseAddress
			.add(m_$BtnBrowse)
			.show()
			.off("click", onBtnAddress);

			m_$BtnAddress.remove();
		}

		var onHudLockRefresh = function () {
			if (m_clientState.playerController.isHudLocked() || (m_clientState.gameState.currentPlayer && m_clientState.gameState.currentPlayer.type == Player.Types.AI)) {
				m_$ToolbarContainer.hide();
			} else {
				m_$ToolbarContainer.show();
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

	
		m_clientState.eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, onTurnChanged);
		m_clientState.eworldSB.subscribe(GameplayEvents.GameState.NO_PLAYING_PLAYERS, onTurnChanged);

		m_clientState.eworldSB.subscribe(EngineEvents.General.GAME_VALIDATION_FAILED, onValidationFailed);
		m_clientState.eworldSB.subscribe(EngineEvents.General.GAME_LOADED, onGameLoaded);
	
		// Hud locking... just hit them all...
		m_clientState.eworldSB.subscribe(ClientEvents.Controller.ACTIONS_CLEARED, onHudLockRefresh);
		m_clientState.eworldSB.subscribe(ClientEvents.Controller.ACTION_CANCEL, onHudLockRefresh);
		m_clientState.eworldSB.subscribe(ClientEvents.Controller.ACTION_PREEXECUTE, onHudLockRefresh);
		m_clientState.eworldSB.subscribe(ClientEvents.Controller.ACTION_EXECUTE, onHudLockRefresh);
		m_clientState.eworldSB.subscribe(ClientEvents.Controller.ACTIONS_OFFERED, onHudLockRefresh);
		m_clientState.eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, onHudLockRefresh);


		//
		// Initialize
		//
		if (m_initData) {
			onBtnLoad(null, m_initData);
		} else {
			onBtnRestart();
		}
	
	
		// Toolbar listeners
		m_subscriber.subscribe(m_$BtnSave, 'click', onBtnSave);
		m_subscriber.subscribe(m_$BtnLoad, 'click', onBtnLoad);
		m_subscriber.subscribe(m_$BtnRemoveTile, 'click', onBtnRemoveTile);
		m_subscriber.subscribe(m_$BtnRestart, 'click', onBtnRestart);
		m_subscriber.subscribe(m_$BtnUndo, 'click', onBtnUndo);
		m_subscriber.subscribe(m_$BtnPlayer, 'click', onBtnPlayer);
		m_subscriber.subscribe(m_$BtnPlayerType, 'click', onBtnPlayerType);
		m_subscriber.subscribe(m_$BtnDebug, 'click', onBtnDebug);
		m_subscriber.subscribe(m_$BtnBrowse, 'click', onBtnBrowse);
		m_subscriber.subscribe(m_$BtnAddress, 'click', onBtnAddress);

		m_subscriber.subscribe(document, 'backbutton', onBackButton);

		return m_clientState;
	}
});