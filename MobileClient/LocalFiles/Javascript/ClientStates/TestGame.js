//===============================================
// TestGame
// Create a test game client state.
//===============================================
"use strict";

ClientStates.setupTestGame = function (m_loadingScreen) {

	var clientState = {
		type: ClientStates.types.TestGame,
		playersData: null,
		gameState: null,
	};
	
	// Utils function.
	var fillTerrainPattern = function (eworld, world, rows) {
		var tile;
	
		var basesCount = 0;

		for(var i = 0; i < rows; ++i) {
			for(var j = Math.ceil(i / 2); j < rows + i / 2; ++j) {
			
				tile = GameWorld.createTileUnmanaged(GameWorldTerrainType.Grass, i, j);
				tile.CTileTerrain.type = GameWorldTerrainType.Grass;
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


	//
	// World
	//
	var eworld = new ECS.EntityWorld();
	var eworldSB = eworld.createSubscriber();

	clientState.eworld = eworld;
	clientState.eworldSB = eworldSB;
	
	eworld.addSystem(eworld.store(UtilsSystem, new UtilsSystem()));
	eworld.addSystem(eworld.store(SynchronizationSystem, new SynchronizationSystem()));

	//
	// World systems
	//
	var world = new GameWorld();
	eworld.addSystem(world);
	eworld.store(GameWorld, world);
	clientState.world = world;
	
	//
	// Gameplay Systems
	//
	var effects = new EffectsSystem();
	eworld.addSystem(effects);
	eworld.addSystem(eworld.store(BattleSystem, new BattleSystem(world)));
	eworld.addSystem(new UnitsSystem());
	eworld.addSystem(new GameStateSystem());
	eworld.addSystem(new TileCapturingSystem());
	eworld.addSystem(new TileBaseSystem());
	eworld.addSystem(new TileVisibilitySystem(world));
	
	var executor = new GameExecutor(eworld, world);
	
	
	var playerController = new PlayerController(world, executor);
	eworld.addSystem(playerController);
	
	clientState.effects = effects;
	clientState.executor = executor;
	clientState.playerController = playerController;


	//
	// Rendering Systems
	//

	var worldRenderer = new GameWorldRenderer($('#GameWorldMap')[0], eworld);
	
	eworld.addSystem(new TileRenderingSystem(worldRenderer));
	eworld.addSystem(new UnitRenderingSystem(worldRenderer));
	eworld.addSystem(new TileStructureRenderingSystem(worldRenderer));
	eworld.addSystem(new AnimationSystem(worldRenderer));
	eworld.addSystem(new LayersUpdateSystem(worldRenderer));
	eworld.addSystem(new IdleAnimationsSystem(worldRenderer));
	eworld.addSystem(new ActionsRenderingSystem(executor));
	eworld.addSystem(new ActionFogRenderingSystem(world));
	eworld.addSystem(new VisibilityFogRenderingSystem(world));
	
	eworld.addSystem(new ActionsMenuController($('#ActionMenu')[0]));

	clientState.worldRenderer = worldRenderer;



	//
	// Initialize stuff
	//
	var m_eworld = clientState.eworld;

	// DEBUG: scrollable toolbar
	var toolbarScroller = new iScroll($('#ToolbarContainer')[0], {
		lockDirection: false,
		hideScrollbar: true,
		bounce: false,
	});
	
	//
	// Handlers
	//
	var savedGame = '';
	var onBtnSave = function () {
		var entities = m_eworld.getEntities();
		
		var fullGameState = {
				gameState: clientState.gameState,
				playersData: clientState.playersData,
				world: m_eworld.getEntities(),
		}
		savedGame = Serialization.serialize(fullGameState, true);
	}
	
	var onBtnLoad = function () {
		if (!savedGame)
			return;

		m_loadingScreen.show();

		setTimeout(function () {
			
			clientState.world.clearTiles();
		
			Utils.invalidate(clientState.playersData);
			Utils.invalidate(clientState.gameState);
		
			var allObjects = [];
		
			var fullGameState = Serialization.deserialize(savedGame, allObjects);
		
			clientState.gameState = fullGameState.gameState;
			clientState.playersData = fullGameState.playersData;
			m_eworld.store(PlayersData, clientState.playersData);
			m_eworld.store(GameState, clientState.gameState);
		
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
			clientState.world.clearTiles();

			if (clientState.playersData)	Utils.invalidate(clientState.playersData);
			if (clientState.gameState)	Utils.invalidate(clientState.gameState);


			// Initialize new data
			clientState.playersData = new PlayersData(m_eworld);
			m_eworld.store(PlayersData, clientState.playersData);
			clientState.playersData.addPlayer('Pl1', Player.Types.Human, Player.Races.Humans, 60);
			clientState.playersData.addPlayer('Pl2', Player.Types.Human, Player.Races.Humans, 120);
			clientState.playersData.addPlayer('Pl3', Player.Types.Human, Player.Races.Humans, 175);
			clientState.playersData.addPlayer('Pl4', Player.Types.Human, Player.Races.Humans, 220);
	
			clientState.gameState = new GameState();
			m_eworld.store(GameState, clientState.gameState);
			
			m_eworld.triggerAsync(EngineEvents.General.GAME_LOADING);

			var ROWS = 10;
			fillTerrainPattern(m_eworld, clientState.world, ROWS);

			m_eworld.triggerAsync(EngineEvents.General.GAME_LOADED);


			clientState.playersData.stopPlaying(clientState.playersData.getPlayer(2));
			clientState.playersData.stopPlaying(clientState.playersData.getPlayer(3));

		}, 200);
	}
	
	var onBtnPlayer = function () {
		m_eworld.trigger(GameplayEvents.GameState.END_TURN);
	}
	
	var onTurnChanged = function (event) {
		if (clientState.gameState.currentPlayer) {
			$('#BtnPlayer').text(clientState.gameState.currentPlayer.name)
		} else {
			$('#BtnPlayer').text('N/a');
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
		
		$('#WorldPlot').css('background-color', 'white');
	}
	

	var onBtnBrowse = function () {
		var address = $('#TbBrowseAddress').val();
		if (address.indexOf('http://') == -1 && address.indexOf('https://') == -1) {
			address = 'http://' + address;
		}

		window.location.href = address;
	}

	// HACK: This is workaround, as iScroller doesn't let the input control to be clicked.
	var onBtnAddress = function () {
		if (toolbarScroller) {
			$('#TbBrowseAddress, #BtnBrowse')
			.insertBefore('#BtnSave')
			.show()
			.off("click", onBtnAddress);
			toolbarScroller.destroy();
			toolbarScroller = null;
		}
	}

	var onHudLockRefresh = function (event) {
		if (clientState.playerController.isHudLocked()) {
			$('#ToolbarContainer').hide();
		} else {
			$('#ToolbarContainer').show();
		}
	}
	
	var onGameLoaded = function (event) {
		m_loadingScreen.hide();
	}
	
	clientState.eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, onTurnChanged);
	clientState.eworldSB.subscribe(GameplayEvents.GameState.NO_PLAYING_PLAYERS, onTurnChanged);

	clientState.eworldSB.subscribe(EngineEvents.General.GAME_LOADED, onGameLoaded);
	
	// Hud locking... just hit them all...
	clientState.eworldSB.subscribe(ClientEvents.Controller.ACTIONS_CLEARED, onHudLockRefresh);
	clientState.eworldSB.subscribe(ClientEvents.Controller.ACTION_CANCEL, onHudLockRefresh);
	clientState.eworldSB.subscribe(ClientEvents.Controller.ACTION_PREEXECUTE, onHudLockRefresh);
	clientState.eworldSB.subscribe(ClientEvents.Controller.ACTION_EXECUTED, onHudLockRefresh);
	clientState.eworldSB.subscribe(ClientEvents.Controller.ACTIONS_OFFERED, onHudLockRefresh);


	//
	// Initialize
	//
	onBtnRestart();
	
	
	// Toolbar listeners
	$('#BtnSave').click(onBtnSave);
	$('#BtnLoad').click(onBtnLoad);
	$('#BtnRemoveTile').click(onBtnRemoveTile);
	$('#BtnRestart').click(onBtnRestart);
	$('#BtnPlayer').click(onBtnPlayer);
	$('#BtnDebug').click(onBtnDebug);
	$('#BtnBrowse').click(onBtnBrowse);
	$('#BtnAddress').click(onBtnAddress);

	return clientState;
};