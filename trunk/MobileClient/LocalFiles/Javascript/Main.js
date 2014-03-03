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
			
			eworld.addUnmanagedEntity(tile);
		}
	}
}

$(function () {
	
	//
	// Properties
	//
	var m_eworld = new ECS.EntityWorld();
	var m_eworldSB = m_eworld.createSubscriber();
	
	//
	// Players
	//
	var m_playersData = new PlayersData(m_eworld);
	m_eworld.store(PlayersData, m_playersData);
	m_playersData.addPlayer('Pl1', Player.Types.Human);
	m_playersData.addPlayer('Pl2', Player.Types.Human);
	m_playersData.addPlayer('Pl3', Player.Types.Human);
	m_playersData.addPlayer('Pl4', Player.Types.Human);
	
	var m_gameState = new GameState();
	m_eworld.store(GameState, m_gameState);
	
	m_playersData.stopPlaying(m_playersData.getPlayer(2));
	m_playersData.stopPlaying(m_playersData.getPlayer(3));
	
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
	m_eworld.addSystem(new TileVisibilitySystem(m_world));
	
	var m_executor = new GameExecutor(m_eworld, m_world);
	
	
	var m_playerController = new PlayerController(m_world, m_executor);
	m_eworld.addSystem(m_playerController);
	
	//
	// Rendering Systems
	//
	
	worldRenderer = new GameWorldRenderer($('#GameWorldMap')[0]);
	
	var m_tileRendering = new TileRenderingSystem(worldRenderer);
	m_eworld.addSystem(m_tileRendering);
	var m_unitRendering = new UnitRenderingSystem(worldRenderer);
	m_eworld.addSystem(m_unitRendering);
	m_eworld.addSystem(new AnimationSystem(worldRenderer));
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
	}
	
	var onBtnRemoveTile = function () {
		// TODO: This uses debug feature that will be removed!
		if (selected)
			selected.destroy();
	}
	
	var onBtnRestart = function () {
		var ROWS = 10;
		m_world.clearTiles();
		fillTerrainPattern(m_eworld, m_world, ROWS);
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
	
	
	
	m_eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, onTurnChanged);
	m_eworldSB.subscribe(GameplayEvents.GameState.NO_PLAYING_PLAYERS, onTurnChanged);
	
	//
	// Initialize
	//
	m_eworld.triggerAsync(EngineEvents.General.GAME_LOADING);

	onBtnRestart();
	onBtnSave();
	
	// All setup is done, initialize the systems.
	m_eworld.triggerAsync(EngineEvents.General.GAME_LOADED);
	

	// Toolbar listeners
	$('#BtnSave').click(onBtnSave);
	$('#BtnLoad').click(onBtnLoad);
	$('#BtnRemoveTile').click(onBtnRemoveTile);
	$('#BtnRestart').click(onBtnRestart);
	$('#BtnPlayer').click(onBtnPlayer);
	$('#BtnDebug').click(onBtnDebug);
	
	// MoSync bindings
	document.addEventListener("backbutton", close, true);
});

