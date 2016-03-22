//===============================================
// ControllerRenderingSystem
// Handles tile rendering.
//===============================================
"use strict";

var ControllerRenderingSystem = function (m_renderer, m_gameToolbar) {
	var self = this;
	
	console.assert(m_renderer instanceof SceneRenderer, "SceneRenderer is required.");
	
	var m_selectedSprite = null;

	var m_$TurnChangedScreen = $('#TurnChanged');
	var m_$TurnChangedPlayerName = $('#TurnChangedPlayerName');

	var m_subscriber = new DOMSubscriber();

	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(ClientEvents.Controller.TILE_SELECTED, onTileSelected);

		self._eworldSB.subscribe(GameplayEvents.GameState.VIEWER_CHANGED, onViewerChanged);
		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, onTurnChanged);

		m_selectedSprite = m_renderer.createSprite(WorldLayers.LayerTypes.Selection, ControllerRenderingSystem.TILE_SELECTED_SPRITE_PATH)
		.size(GTile.TILE_WIDTH, GTile.TILE_HEIGHT);

		onTileSelected(null);
	}

	this.uninitialize = function () {
		m_subscriber.unsubscribeAll();
	}

	var onTileSelected = function (tile) {

		if (tile) {
			var coords = m_renderer.getRenderedTilePosition(tile.CTile.row, tile.CTile.column);
			m_selectedSprite.position(coords.x, coords.y);
			m_selectedSprite.update();
		}

		if (tile)
			m_selectedSprite.show();
		else
			m_selectedSprite.hide();

		self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.Selection);
	}

	var onViewerChanged = function (gameState, hasJustLoaded) {
		
		if (gameState.viewerPlayer) {
			m_$TurnChangedScreen.show();
			m_gameToolbar.hideToolbar();

			m_$TurnChangedPlayerName.text(gameState.viewerPlayer.name);
		}
	}

	var onTurnChanged = function (gameState) {
		m_gameToolbar.hideToolbar();
	}

	var onTurnChangedReady = function () {
		m_$TurnChangedScreen.hide();
		m_gameToolbar.showToolbar();
	}

	m_subscriber.subscribe($('#BtnTurnChangedReady'), 'click', onTurnChangedReady);
}

ControllerRenderingSystem.TILE_SELECTED_SPRITE_PATH = 'Assets-Scaled/Render/Images/hex_selected.png';

ECS.EntityManager.registerSystem('ControllerRenderingSystem', ControllerRenderingSystem);
SystemsUtils.supplySubscriber(ControllerRenderingSystem);
