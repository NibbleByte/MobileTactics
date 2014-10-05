//===============================================
// TestGame
// Create a test game client state.
//===============================================
"use strict";

ClientStates.factories[ClientStates.types.TestGame] = new function () {
	var self = this;

	var m_$GameWorldMap = $('#GameWorldMap');
	var m_$ActionMenu = $('#ActionMenu');
	var m_$ToolbarContainer = $('#ToolbarContainer');

	var m_$BtnSave = $('#BtnSave');
	var m_$BtnLoad = $('#BtnLoad');
	var m_$BtnRemoveTile = $('#BtnRemoveTile');
	var m_$BtnRestart = $('#BtnRestart');
	var m_$BtnPlayer = $('#BtnPlayer');
	var m_$BtnDebug = $('#BtnDebug');
	var m_$BtnBrowse = $('#BtnBrowse');
	var m_$BtnAddress = $('#BtnAddress');

	var m_$TbBrowseAddress = $('#TbBrowseAddress');

	// DEBUG: scrollable toolbar
	var m_toolbarScroller = new iScroll(m_$ToolbarContainer[0], {
		lockDirection: false,
		hideScrollbar: true,
		bounce: false,
	});


	var m_clientState = null;

	// Utils function.
	var fillTerrainPattern = function (eworld, rows) {
		var tile;
	
		var basesCount = 0;

		for(var i = 0; i < rows; ++i) {
			for(var j = Math.ceil(i / 2); j < rows + i / 2; ++j) {
			
				tile = GameWorld.createTileUnmanaged(GameWorldTerrainType.Grass, i, j);
				if (i % 3 <= 1 && j % 4 >= 2) {
					tile.CTileTerrain.type = GameWorldTerrainType.Dirt;
				}
				if (i % 7 <= 2 && j % 5 <= 1) {
					tile.CTileTerrain.type = GameWorldTerrainType.Mountain;
				}
				if (i >= rows - 2 && rows > 4) {
					tile.CTileTerrain.type = GameWorldTerrainType.Water;
				}
			
				var playersData = eworld.extract(PlayersData);
				if (i == Math.floor(rows / 4) || i == Math.floor(rows / 3) || i == Math.floor(rows / 2)) {
					if (j == i || j == rows - i) {
						tile.CTileTerrain.type = GameWorldTerrainType.Base;
						tile.addComponent(CTileOwner);

						if (basesCount % 3 == 0) {
							tile.CTileOwner.owner = playersData.players[basesCount % 2];
						}

						basesCount++;
					}
				}
			
				eworld.addUnmanagedEntity(tile);
			}
		}
	}

	this.cleanUp = function () {

		m_$BtnSave.off('click');
		m_$BtnLoad.off('click');
		m_$BtnRemoveTile.off('click');
		m_$BtnRestart.off('click');
		m_$BtnPlayer.off('click');
		m_$BtnDebug.off('click');
		m_$BtnBrowse.off('click');
		m_$BtnAddress.off('click');

		if (m_clientState) {
			m_clientState.gameState = null;
			m_clientState.playersData = null;

			m_clientState.eworldSB.unsubscribeAll();
			m_clientState.executor = null;
			m_clientState.eworld.destroy();
			m_clientState.worldRenderer.destroy();
			m_clientState = null;
		}
	};

	this.setup = function (m_loadingScreen) {

		m_clientState = {
			type: ClientStates.types.TestGame,
			playersData: null,
			gameState: null,
		};


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
		m_eworld.addSystem(effects);
		m_eworld.addSystem(m_eworld.store(BattleSystem, new BattleSystem(world)));
		m_eworld.addSystem(new UnitsSystem());
		m_eworld.addSystem(new GameStateSystem());
		m_eworld.addSystem(new TileCapturingSystem());
		m_eworld.addSystem(new TileBaseSystem());
		m_eworld.addSystem(new TileVisibilitySystem(world));
	
		var executor = new GameExecutor(m_eworld, world);
	
	
		var playerController = new PlayerController(world, executor);
		m_eworld.addSystem(playerController);
	
		m_clientState.effects = effects;
		m_clientState.executor = executor;
		m_clientState.playerController = playerController;


		//
		// Rendering Systems
		//

		var worldRenderer = new GameWorldRenderer(m_$GameWorldMap[0], m_eworld);
	
		m_eworld.addSystem(new TileRenderingSystem(worldRenderer));
		m_eworld.addSystem(new UnitRenderingSystem(worldRenderer));
		m_eworld.addSystem(new TileStructureRenderingSystem(worldRenderer));
		m_eworld.addSystem(new AnimationSystem(worldRenderer));
		m_eworld.addSystem(new LayersUpdateSystem(worldRenderer));
		m_eworld.addSystem(new IdleAnimationsSystem(worldRenderer));
		m_eworld.addSystem(new ActionsRenderingSystem(executor));
		m_eworld.addSystem(new ActionFogRenderingSystem(world));
		m_eworld.addSystem(new VisibilityFogRenderingSystem(world));
	
		m_eworld.addSystem(new ActionsMenuController(m_$ActionMenu[0]));

		m_clientState.worldRenderer = worldRenderer;


	
		//
		// Handlers
		//
		var savedGame = '';
		var onBtnSave = function () {
			var entities = m_eworld.getEntities();
		
			var fullGameState = {
					gameState: m_clientState.gameState,
					playersData: m_clientState.playersData,
					world: m_eworld.getEntities(),
			};
			savedGame = Serialization.serialize(fullGameState, true);
		}
	
		var onBtnLoad = function () {
			if (!savedGame)
				return;

			m_loadingScreen.show();

			setTimeout(function () {
			
				m_clientState.world.clearTiles();
		
				Utils.invalidate(m_clientState.playersData);
				Utils.invalidate(m_clientState.gameState);
		
				var allObjects = [];
		
				var fullGameState = Serialization.deserialize(savedGame, allObjects);
		
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
				fillTerrainPattern(m_eworld, ROWS);

				m_eworld.triggerAsync(EngineEvents.General.GAME_LOADED);


				m_clientState.playersData.stopPlaying(m_clientState.playersData.getPlayer(2));
				m_clientState.playersData.stopPlaying(m_clientState.playersData.getPlayer(3));

			}, 200);
		}
	
		var onBtnPlayer = function () {
			m_eworld.trigger(GameplayEvents.GameState.END_TURN);
		}
	
		var onTurnChanged = function (event) {
			if (m_clientState.gameState.currentPlayer) {
				m_$BtnPlayer.text(m_clientState.gameState.currentPlayer.name)
			} else {
				m_$BtnPlayer.text('N/a');
			}
		}
	
		var onBtnDebug = function () {
			var entities = m_eworld.getEntities();
		
			for(var i = 0; i < entities.length; ++i) {
				var entity = entities[i];
			
				var tile = entity.CTile;
				var rendering = entity.CTileRendering;
			
				if (!tile || !rendering)
					continue;
			
				$(rendering.sprite.dom)
				.html(	'<br />' +
						'RC: ' + tile.row + ', ' + tile.column +
						'<br />' +
						'X: ' + parseInt(rendering.sprite.x) +
						'<br />' +
						'Y: ' + parseInt(rendering.sprite.y));
			
			
				$(rendering.sprite.dom)
				.css('background', 
						(tile.column % 2) 
						? 'url("Assets/Render/Images/hex.png") no-repeat' 
						: 'url("Assets/Render/Images/hex_bluesh.png") no-repeat'
					)
				.css('background-size', '100% 100%');
			}
		
			// Added by the GameWorldRenderer
			$('#WorldPlot').css('background-color', 'white');
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
			if (m_toolbarScroller) {
				m_$TbBrowseAddress.add(m_$BtnBrowse)
				.insertBefore(m_$BtnSave)
				.show()
				.off("click", onBtnAddress);
				m_toolbarScroller.destroy();
				m_toolbarScroller = null;
			}
		}

		var onHudLockRefresh = function (event) {
			if (m_clientState.playerController.isHudLocked()) {
				m_$ToolbarContainer.hide();
			} else {
				m_$ToolbarContainer.show();
			}
		}
	
		var onGameLoaded = function (event) {
			m_loadingScreen.hide();
		}
	
		m_clientState.eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, onTurnChanged);
		m_clientState.eworldSB.subscribe(GameplayEvents.GameState.NO_PLAYING_PLAYERS, onTurnChanged);

		m_clientState.eworldSB.subscribe(EngineEvents.General.GAME_LOADED, onGameLoaded);
	
		// Hud locking... just hit them all...
		m_clientState.eworldSB.subscribe(ClientEvents.Controller.ACTIONS_CLEARED, onHudLockRefresh);
		m_clientState.eworldSB.subscribe(ClientEvents.Controller.ACTION_CANCEL, onHudLockRefresh);
		m_clientState.eworldSB.subscribe(ClientEvents.Controller.ACTION_PREEXECUTE, onHudLockRefresh);
		m_clientState.eworldSB.subscribe(ClientEvents.Controller.ACTION_EXECUTED, onHudLockRefresh);
		m_clientState.eworldSB.subscribe(ClientEvents.Controller.ACTIONS_OFFERED, onHudLockRefresh);


		//
		// Initialize
		//
		onBtnRestart();
	
	
		// Toolbar listeners
		m_$BtnSave.click(onBtnSave);
		m_$BtnLoad.click(onBtnLoad);
		m_$BtnRemoveTile.click(onBtnRemoveTile);
		m_$BtnRestart.click(onBtnRestart);
		m_$BtnPlayer.click(onBtnPlayer);
		m_$BtnDebug.click(onBtnDebug);
		m_$BtnBrowse.click(onBtnBrowse);
		m_$BtnAddress.click(onBtnAddress);

		return m_clientState;
	}
};