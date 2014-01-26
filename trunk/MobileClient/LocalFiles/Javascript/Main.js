// Main entry point

"use strict";

// DEBUG: Global access
var world;
var render;
var effects;
var worldRenderer;
var players;

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
	
	//
	// Players
	//
	var m_playersData = new PlayersData(m_eworld);
	m_eworld.blackboard[PlayersData.BLACKBOARD_NAME] = m_playersData;
	m_playersData.addPlayer('Pl1', Player.Types.Human);
	m_playersData.addPlayer('Pl2', Player.Types.Human);
	m_playersData.addPlayer('Pl3', Player.Types.Human);
	m_playersData.addPlayer('Pl4', Player.Types.Human);
	
	m_eworld.blackboard[PlayerController.BB_CURRENT_PLAYER] = m_playersData.getFirstPlayingPlayer();
	$('#BtnPlayer').text(m_eworld.blackboard[PlayerController.BB_CURRENT_PLAYER].name)
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
	
	m_eworld.addSystem(new ActionsMenuController($('#ActionMenu')[0]));
	
	
	// DEBUG: global access
	world = m_world;
	render = m_tileRendering;
	effects = m_effects;
	players = m_playersData;
	
	// DEBUG: scrollable toolbar
	var toolbarScroller = new iScroll($('#ToolbarContainer')[0], {
		lockDirection: false,
		hideScrollbar: true,
		bounce: false,
	});
	
	var savedGame = '';
	var onBtnSave = function () {
		var entities = m_eworld.getEntities();
		
		var gameState = {
				players: m_eworld.blackboard[PlayersData.BLACKBOARD_NAME].getPlayers(),
				world: m_eworld.getEntities(),
		}
		savedGame = Serialization.serialize(gameState, true);
	}
	
	var onBtnLoad = function () {
		m_world.clearTiles();
		
		var gameState = Serialization.deserialize(savedGame);
		
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
		var ROWS = 10;
		m_world.clearTiles();
		fillTerrainPattern(m_eworld, m_world, ROWS);
	}
	
	var onBtnPlayer = function () {
		m_eworld.blackboard[PlayerController.BB_CURRENT_PLAYER] = 
			m_playersData.getNextPlayingPlayer(m_eworld.blackboard[PlayerController.BB_CURRENT_PLAYER]);
		
		$('#BtnPlayer').text(m_eworld.blackboard[PlayerController.BB_CURRENT_PLAYER].name)
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
	$('#BtnDebug').click(onBtnDebug);
	
	// MoSync bindings
	document.addEventListener("backbutton", close, true);
});

