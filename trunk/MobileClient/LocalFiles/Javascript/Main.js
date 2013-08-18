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
	var tiles = [];
	
	for(var i = 0; i < rows; ++i) {
		for(var j = 0; j < i * 2 + 1; ++j) {
			
			tile = eworld.createEntity();
			tile.addComponent(CTile);
			tile.CTile.row = i;
			tile.CTile.column = j;
			
			tile.addComponent(CTileRendering);
			
			tiles.push(tile);
			
			if (i < rows - 1) {
				tile = eworld.createEntity();
				tile.addComponent(CTile);
				tile.CTile.row = (rows - 1) * 2 - i;
				tile.CTile.column = (rows - 1) * 2 - j;
				
				tile.addComponent(CTileRendering);
				
				tiles.push(tile);
			}
		}
	}
	
	world.loadTiles(tiles);
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
	
	
	//
	// Initialize
	//
	var ROWS = 8;
	fillTerrainPattern(m_eworld, m_world, ROWS);
	
	// MoSync bindings
	document.addEventListener("backbutton", close, true);
});