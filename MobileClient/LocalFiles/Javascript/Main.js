// Main entry point

"use strict";

// DEBUG: Global access
var world;
var render;

/**
 * Handle the backbutton event.
 */
function close() {
	// Close the application if the back key is pressed.
	mosync.bridge.send(["close"]);
}

var fillTerrainPattern = function (world, rows) {
	var tile;
	var tiles = [];
	
	for(var i = 0; i < rows; ++i) {
		for(var j = 0; j < i * 2 + 1; ++j) {
			
			tile = new Entity();
			EntityManager.addComponents(tile, CTile);
			tile.row(i);
			tile.column(j);
			
			tiles.push(tile);
			
			if (i < rows - 1) {
				tile = new Entity();
				EntityManager.addComponents(tile, CTile);
				tile.row((rows - 1) * 2 - i);
				tile.column((rows - 1) * 2 - j);
				
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
	var m_world = new GameWorld();
	
	var ROWS = 8;
	// TODO: For Debug
	fillTerrainPattern(m_world, ROWS);
	
	var m_worldRenderer = new GameWorldRenderer(m_world, $('#GameWorldMap')[0]);
	var m_playerController = new PlayerController(m_worldRenderer);
	
	// DEBUG: global access
	world = m_world;
	render = m_worldRenderer;
	
	
	m_worldRenderer.fullWorldRefresh();
	
	// MoSync bindings
	document.addEventListener("backbutton", close, true);
});