//===============================================
// ControllerRenderingSystem
// Handles tile rendering.
//===============================================
"use strict";

var ControllerRenderingSystem = function (m_renderer) {
	var self = this;
	
	console.assert(m_renderer instanceof GameWorldRenderer, "GameWorldRenderer is required.");
	
	var m_selectedSprite = null;

	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(ClientEvents.Controller.TILE_SELECTED, onTileSelected);

		m_selectedSprite = m_renderer.createSprite(WorldLayers.LayerTypes.Selection, ControllerRenderingSystem.TILE_SELECTED_SPRITE_PATH)
		.size(GTile.TILE_WIDTH, GTile.TILE_HEIGHT);

		onTileSelected(null, null);
	}

	var onTileSelected = function (event, tile) {

		if (tile) {
			var coords = m_renderer.getRenderedTilePosition(tile.CTile.row, tile.CTile.column);
			m_selectedSprite.position(coords.x, coords.y);
			m_selectedSprite.update();
		}

		m_selectedSprite.skipDrawing = !tile;

		self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.Selection);
	}
}

ControllerRenderingSystem.TILE_SELECTED_SPRITE_PATH = 'Assets/Render/Images/hex_selected.png';

ECS.EntityManager.registerSystem('ControllerRenderingSystem', ControllerRenderingSystem);
SystemsUtils.supplySubscriber(ControllerRenderingSystem);
