// Main entry point

"use strict";

// DEBUG: Global access
var world;
var render;
var effects;
var worldRenderer;

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
		for(var j = 0; j < i * 2 + 1; ++j) {
			
			tile = new ECS.Entity();
			tile.addComponent(CTile);
			tile.CTile.row = i;
			tile.CTile.column = j;
			
			eworld.addUnmanagedEntity(tile);
			
			if (i < rows - 1) {
				tile = new ECS.Entity();
				tile.addComponent(CTile);
				tile.CTile.row = (rows - 1) * 2 - i;
				tile.CTile.column = (rows - 1) * 2 - j;
				
				eworld.addUnmanagedEntity(tile);
			}
		}
	}
}

$(function () {
	
	//
	// Properties
	//
	var m_eworld = new ECS.EntityWorld();
	
	//
	// Players
	//
	var m_playersData = new PlayersData(m_eworld);
	m_eworld.blackgoard[PlayersData.BLACKBOARD_NAME] = m_playersData;
	m_playersData.addPlayer('Pl1', Player.Types.Human);
	m_playersData.addPlayer('Pl2', Player.Types.Human);
	m_playersData.addPlayer('Pl3', Player.Types.Human);
	m_playersData.addPlayer('Pl4', Player.Types.Human);
	
	m_eworld.blackgoard['currentPlayer'] = m_playersData.getFirstPlayingPlayer();
	$('#BtnPlayer').text(m_eworld.blackgoard['currentPlayer'].name)
	m_playersData.stopPlaying(m_playersData.getPlayer(2));
	m_playersData.stopPlaying(m_playersData.getPlayer(3));
	
	//
	// World systems
	//
	var m_world = new GameWorld();
	m_eworld.addSystem(m_world);
	
	//
	// Gameplay Systems
	//
	var m_effects = new EffectsSystem();
	m_eworld.addSystem(m_effects);
	m_eworld.addSystem(new UnitsSystem());
	
	var m_executor = new GameExecutor(m_world);
	
	
	var m_playerController = new PlayerController(m_executor);
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
	
	m_eworld.addSystem(new ActionsMenuController($('#ActionMenu')[0]));
	
	
	// DEBUG: global access
	world = m_world;
	render = m_tileRendering;
	effects = m_effects;
	
	var savedGame = '';
	var onBtnSave = function () {
		var entities = m_eworld.getEntities();
		
		var gameState = {
				players: m_eworld.blackgoard[PlayersData.BLACKBOARD_NAME].getPlayers(),
				world: m_eworld.getEntities(),
		}
		savedGame = Serialization.serialize(gameState, true);
	}
	
	var onBtnLoad = function () {
		m_world.clearTiles();
		
		var gameState = Serialization.deserialize(savedGame);
		
		m_playersData = new PlayersData(m_eworld);
		m_eworld.blackgoard[PlayersData.BLACKBOARD_NAME] = m_playersData;
		m_playersData.setPlayers(gameState.players);
		
		var entities = gameState.world;
		for(var i = 0; i < entities.length; ++i) {
			
			UnitsFactory.postDeserialize(entities[i]);
			m_eworld.addUnmanagedEntity(entities[i]);
		}
		
		for(var i = 0; i < entities.length; ++i) {
			m_eworld.trigger(EngineEvents.Serialization.ENTITY_DESERIALIZED, entities[i]);
		}
	}
	
	var onBtnRemoveTile = function () {
		// TODO: This uses debug feature that will be removed!
		if (selected)
			selected.destroy();
	}
	
	var onBtnRestart = function () {
		var ROWS = 8;
		m_world.clearTiles();
		fillTerrainPattern(m_eworld, m_world, ROWS);
	}
	
	var onBtnPlayer = function () {
		m_eworld.blackgoard['currentPlayer'] = m_playersData.getNextPlayingPlayer(m_eworld.blackgoard['currentPlayer']);
		
		$('#BtnPlayer').text(m_eworld.blackgoard['currentPlayer'].name)
	}
	
	//
	// Initialize
	//
	onBtnRestart();
	onBtnSave();

	// Toolbar listeners
	$('#BtnSave').click(onBtnSave);
	$('#BtnLoad').click(onBtnLoad);
	$('#BtnRemoveTile').click(onBtnRemoveTile);
	$('#BtnRestart').click(onBtnRestart);
	$('#BtnPlayer').click(onBtnPlayer);
	
	// MoSync bindings
	document.addEventListener("backbutton", close, true);
});

