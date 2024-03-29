//===============================================
// TestGame
// Create a test game client state.
//===============================================
"use strict";

ClientStateManager.registerState(ClientStateManager.types.TestGame, new function () {
	var self = this;

	var m_$GameWorldMap = $('#GameWorldMap').hide();
	var m_$ActionMenu = $('#ActionMenu').hide();
	var m_$ToolbarMore = $('#ToolbarMore').hide();

	var m_$BtnSave = $('#BtnSave');
	var m_$BtnLoad = $('#BtnLoad');
	var m_$BtnRemoveTile = $('#BtnRemoveTile');
	var m_$BtnRestart = $('#BtnRestart');
	var m_$BtnUndo= $('#BtnUndo');
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
						tile.CTileTerrain.type = GameWorldTerrainType.Base;
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
				
				if (i == 2 && j == 4) {
					tile.addComponentSafe(CTileOwner);
					tile.CTileTerrain.type = GameWorldTerrainType.Base;
					tile.CTileOwner.owner = playersData.players[0];
				}

				// Player 1
				if (i == 3 && j == 10) {
					tile.addComponentSafe(CTileOwner);
					tile.CTileTerrain.type = GameWorldTerrainType.HQ;
					tile.CTileOwner.owner = playersData.players[1];
				}				

				if (i == 3 && j == 9) {
					tile.addComponentSafe(CTileOwner);
					tile.CTileTerrain.type = GameWorldTerrainType.Base;
					tile.CTileOwner.owner = playersData.players[1];
				}

				// No one
				if (i == 6 && j == 7) {
					tile.addComponentSafe(CTileOwner);
					tile.CTileTerrain.type = GameWorldTerrainType.Base;
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

	this.setup = function (m_loadingScreen, m_initData, m_initPlayersReplacements) {

		m_clientState = {
			playersData: null,
			gameState: null,
			gameMetaData: null,
		};

		m_$GameWorldMap.show();

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
		m_eworld.addSystem(new UnitsSystem(world));
		m_eworld.addSystem(effects);
		m_eworld.addSystem(new GameStateSystem());
		m_eworld.addSystem(new VictoryStateMonitor());
		m_eworld.addSystem(new TileStructuresSystem());	// Before TileVisibilitySystem, because structures also define visibility
		m_eworld.addSystem(new ResourcesSystem());		// After TileStructuresSystem for correct current structures counting.
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
		m_eworld.addSystem(new GameUISystem());
		m_eworld.addSystem(new UIUnitsInfo());
		m_eworld.addSystem(new UIGameStateInfo());
		m_eworld.addSystem(new UIGameHUD());
		m_eworld.addSystem(new UIGameMenu());
		m_eworld.addSystem(new UITurnChanged());
		m_eworld.addSystem(new ControllerRenderingSystem(worldRenderer));
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
		
		var onBtnLoad = function (event, data, playersReplacements) {
			
			if (!data)
				data = m_clientState.savedGame;

			if (!data)
				return;

			m_loadingScreen.show();

			setTimeout(function () {
			
				var gameLoader = new GameLoader(m_clientState, m_eworld);

				gameLoader.load(data, function () {

					m_clientState.gameState.fogOfWar = m_fogOfWar;


					if (!m_clientState.gameState.isCustomMap && playersReplacements) {

						for(var i = 0; i < playersReplacements.length; ++i) {
							var replacement = playersReplacements[i];

							var player = m_clientState.playersData.getPlayer(replacement.playerId);

							player.name = replacement.name;
							player.race = replacement.race;
							player.colorHue = replacement.colorHue;
							player.teamId = replacement.teamId;
							player.type = replacement.type;
							player.isPlaying = replacement.isPlaying;
						}
					}

				});

				if (!m_clientState.gameState.gameStarted) {
					m_eworld.trigger(GameplayEvents.GameState.START_GAME);
				}

				// Avoid refreshing while loading.
				m_eworld.extract(GameWorldRenderer).refresh();

			}, 200);
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

					m_clientState.playersData.addPlayer('Pl1', Player.Types.Human, Player.Races.Empire);
					m_clientState.playersData.addPlayer('Pl2', Player.Types.Human, Player.Races.JunkPeople);
					m_clientState.playersData.addPlayer('Pl3', Player.Types.Human, Player.Races.Developers);
					m_clientState.playersData.addPlayer('Pl4', Player.Types.Human, Player.Races.Developers);

				},

				function () {
					var ROWS = 10, COLUMNS = 10;
					fillTerrainPattern(m_eworld, m_clientState.world, m_clientState.playersData, ROWS, COLUMNS);
				});

				m_eworld.trigger(GameplayEvents.GameState.START_GAME);

				// Avoid refreshing while loading.
				m_eworld.extract(GameWorldRenderer).refresh();


				m_clientState.playersData.setIsPlaying(m_clientState.playersData.getPlayer(2), false);
				m_clientState.playersData.setIsPlaying(m_clientState.playersData.getPlayer(3), false);

			}, 200);
		}

		
		var onBtnUndo = function () {
			playerController.undoLastAction();
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

		var onHudLockRefresh = function (lock) {
			m_$ToolbarMore.hide();
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

		var onMenuButton = function () {
			if (!playerController.isHudLocked() && m_clientState.gameState.currentPlayer.type == Player.Types.Human) {
				m_$ToolbarMore.toggle();
			}
		}

		m_clientState.eworldSB.subscribe(EngineEvents.General.GAME_VALIDATION_FAILED, onValidationFailed);
		m_clientState.eworldSB.subscribe(EngineEvents.General.GAME_LOADED, onGameLoaded);
	
		m_clientState.eworldSB.subscribe(ClientEvents.UI.LOCK_GAME_HUD, onHudLockRefresh);

		//
		// Initialize
		//
		if (m_initData) {
			onBtnLoad(null, m_initData, m_initPlayersReplacements);
		} else {
			onBtnRestart();
		}
	
	
		// Toolbar listeners
		m_subscriber.subscribe(m_$BtnSave, 'click', onBtnSave);
		m_subscriber.subscribe(m_$BtnLoad, 'click', onBtnLoad);
		m_subscriber.subscribe(m_$BtnRemoveTile, 'click', onBtnRemoveTile);
		m_subscriber.subscribe(m_$BtnRestart, 'click', onBtnRestart);
		m_subscriber.subscribe(m_$BtnUndo, 'click', onBtnUndo);
		m_subscriber.subscribe(m_$BtnPlayerType, 'click', onBtnPlayerType);
		m_subscriber.subscribe(m_$BtnDebug, 'click', onBtnDebug);
		m_subscriber.subscribe(m_$BtnBrowse, 'click', onBtnBrowse);
		m_subscriber.subscribe(m_$BtnAddress, 'click', onBtnAddress);

		m_subscriber.subscribe(document, 'backbutton', onBackButton);
		m_subscriber.subscribe(document, 'menubutton', onMenuButton);
		m_subscriber.subscribe('#LbCredits', 'click', onMenuButton);

		return m_clientState;
	}
});