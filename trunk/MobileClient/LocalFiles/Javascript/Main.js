// Main entry point

"use strict";

// DEBUG: Global access
var world;
var render;
var effects;
var worldRenderer;
var players;
var gameState;

/**
 * Handle the backbutton event.
 */
function close() {
	// Close the application if the back key is pressed.
	mosync.bridge.send(["close"]);
}

var fillTerrainPattern = function (eworld, world, rows) {
	var tile;
	
	var basesCount = 0;

	for(var i = 0; i < rows; ++i) {
		for(var j = Math.ceil(i / 2); j < rows + i / 2; ++j) {
			
			tile = new ECS.Entity();
			tile.addComponent(CTile);
			tile.addComponent(CTileTerrain);
			tile.CTile.row = i;
			tile.CTile.column = j;
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

$(function () {
	
	//
	// Init utils
	//
	var m_console = initConsole();
	var m_loadingScreen = $('#LoadingScreen');

	//
	// World
	//
	var m_eworld = new ECS.EntityWorld();
	var m_eworldSB = m_eworld.createSubscriber();
	

	//
	// Players & Game state
	//
	var m_gameState = null;
	var m_playersData = null;

	m_eworld.addSystem(m_eworld.store(UtilsSystem, new UtilsSystem()));

	//
	// World systems
	//
	var m_world = new GameWorld();
	m_eworld.addSystem(m_world);
	m_eworld.store(GameWorld, m_world);
	
	//
	// Gameplay Systems
	//
	var m_effects = new EffectsSystem();
	m_eworld.addSystem(m_effects);
	m_eworld.addSystem(new UnitsSystem());
	m_eworld.addSystem(new GameStateSystem());
	m_eworld.addSystem(new TileCapturingSystem());
	m_eworld.addSystem(new TileBaseSystem());
	m_eworld.addSystem(new TileVisibilitySystem(m_world));
	
	var m_executor = new GameExecutor(m_eworld, m_world);
	
	
	var m_playerController = new PlayerController(m_world, m_executor);
	m_eworld.addSystem(m_playerController);
	
	//
	// Rendering Systems
	//
	
	worldRenderer = new GameWorldRenderer($('#GameWorldMap')[0], m_eworld);
	
	var m_tileRendering = new TileRenderingSystem(worldRenderer);
	m_eworld.addSystem(m_tileRendering);
	var m_unitRendering = new UnitRenderingSystem(worldRenderer);
	m_eworld.addSystem(m_unitRendering);
	m_eworld.addSystem(new TileStructureRenderingSystem(worldRenderer));
	m_eworld.addSystem(new AnimationSystem(worldRenderer));
	m_eworld.addSystem(new LayersUpdateSystem(worldRenderer));
	m_eworld.addSystem(new IdleAnimationsSystem(worldRenderer));
	m_eworld.addSystem(new ActionsRenderingSystem(m_executor));
	m_eworld.addSystem(new ActionFogRenderingSystem(m_world));
	m_eworld.addSystem(new VisibilityFogRenderingSystem(m_world));
	
	m_eworld.addSystem(new ActionsMenuController($('#ActionMenu')[0]));
	
	
	// DEBUG: global access
	world = m_world;
	render = m_tileRendering;
	effects = m_effects;
	players = m_playersData;
	gameState = m_gameState;
	
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
				gameState: m_gameState,
				playersData: m_playersData,
				world: m_eworld.getEntities(),
		}
		savedGame = Serialization.serialize(fullGameState, true);
	}
	
	var onBtnLoad = function () {
		if (!savedGame)
			return;

		m_loadingScreen.show();

		setTimeout(function () {
			
			m_world.clearTiles();
		
			Utils.invalidate(m_playersData);
			Utils.invalidate(m_gameState);
		
			var allObjects = [];
		
			var fullGameState = Serialization.deserialize(savedGame, allObjects);
		
			m_gameState = fullGameState.gameState;
			m_playersData = fullGameState.playersData;
			m_eworld.store(PlayersData, m_playersData);
			m_eworld.store(GameState, m_gameState);
			players = m_playersData;
			gameState = m_gameState;
		
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
			m_world.clearTiles();

			if (m_playersData)	Utils.invalidate(m_playersData);
			if (m_gameState)	Utils.invalidate(m_gameState);


			// Initialize new data
			m_playersData = new PlayersData(m_eworld);
			m_eworld.store(PlayersData, m_playersData);
			m_playersData.addPlayer('Pl1', Player.Types.Human, 60);
			m_playersData.addPlayer('Pl2', Player.Types.Human, 120);
			m_playersData.addPlayer('Pl3', Player.Types.Human, 175);
			m_playersData.addPlayer('Pl4', Player.Types.Human, 220);
	
			m_gameState = new GameState();
			m_eworld.store(GameState, m_gameState);
	
			gameState = m_gameState;
			players = m_playersData;
		

			m_eworld.triggerAsync(EngineEvents.General.GAME_LOADING);

			var ROWS = 10;
			fillTerrainPattern(m_eworld, m_world, ROWS);

			m_eworld.triggerAsync(EngineEvents.General.GAME_LOADED);


			m_playersData.stopPlaying(m_playersData.getPlayer(2));
			m_playersData.stopPlaying(m_playersData.getPlayer(3));

		}, 200);
	}
	
	var onBtnPlayer = function () {
		m_eworld.trigger(GameplayEvents.GameState.END_TURN);
	}
	
	var onTurnChanged = function (event) {
		if (m_gameState.currentPlayer) {
			$('#BtnPlayer').text(m_gameState.currentPlayer.name)
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
		if (m_playerController.isHudLocked()) {
			$('#ToolbarContainer').hide();
		} else {
			$('#ToolbarContainer').show();
		}
	}
	
	var onGameLoaded = function (event) {
		m_loadingScreen.hide();
	}
	
	m_eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, onTurnChanged);
	m_eworldSB.subscribe(GameplayEvents.GameState.NO_PLAYING_PLAYERS, onTurnChanged);

	m_eworldSB.subscribe(EngineEvents.General.GAME_LOADED, onGameLoaded);
	
	// Hud locking... just hit them all...
	m_eworldSB.subscribe(ClientEvents.Controller.ACTIONS_CLEARED, onHudLockRefresh);
	m_eworldSB.subscribe(ClientEvents.Controller.ACTION_CANCEL, onHudLockRefresh);
	m_eworldSB.subscribe(ClientEvents.Controller.ACTION_PREEXECUTE, onHudLockRefresh);
	m_eworldSB.subscribe(ClientEvents.Controller.ACTION_EXECUTED, onHudLockRefresh);
	m_eworldSB.subscribe(ClientEvents.Controller.ACTIONS_OFFERED, onHudLockRefresh);


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
	
	// MoSync bindings
	document.addEventListener("backbutton", close, true);
});

