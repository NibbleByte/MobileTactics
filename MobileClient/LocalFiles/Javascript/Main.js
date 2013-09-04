// Main entry point

"use strict";

// DEBUG: Global access
var world;
var render;
var effects;

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
	
	var worldRenderer = new GameWorldRenderer($('#GameWorldMap')[0]);
	
	var m_tileRendering = new TileRenderingSystem(worldRenderer);
	m_eworld.addSystem(m_tileRendering);
	var m_unitRendering = new UnitRenderingSystem(worldRenderer);
	m_eworld.addSystem(m_unitRendering);
	
	
	// DEBUG: global access
	world = m_world;
	render = m_tileRendering;
	effects = m_effects;
	
	var savedWorld = '';
	var onBtnSave = function () {
		var entities = m_eworld.getEntities();
		savedWorld = Serialization.serialize(entities, true);
	}
	
	var onBtnLoad = function () {
		m_world.clearTiles();
		
		var entities = Serialization.deserialize(savedWorld);
		for(var i = 0; i < entities.length; ++i) {
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
	
	// MoSync bindings
	document.addEventListener("backbutton", close, true);
});

