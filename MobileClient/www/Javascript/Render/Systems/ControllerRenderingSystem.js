//===============================================
// ControllerRenderingSystem
// Handles tile rendering.
//===============================================
"use strict";

var ControllerRenderingSystem = function (m_renderer, m_$creditsLabel) {
	var self = this;
	
	console.assert(m_renderer instanceof SceneRenderer, "SceneRenderer is required.");
	
	var m_selectedSprite = null;

	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(ClientEvents.Controller.TILE_SELECTED, onTileSelected);

		self._eworldSB.subscribe(GameplayEvents.Resources.CURRENT_CREDITS_CHANGED, onCreditsChanged);
		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, onTurnChanged);

		self._eworldSB.subscribe(RenderEvents.FightAnimations.FIGHT_STARTED, hideCredits);
		self._eworldSB.subscribe(RenderEvents.FightAnimations.FIGHT_FINISHED, showCredits);

		m_selectedSprite = m_renderer.createSprite(WorldLayers.LayerTypes.Selection, ControllerRenderingSystem.TILE_SELECTED_SPRITE_PATH)
		.size(GTile.TILE_WIDTH, GTile.TILE_HEIGHT);

		onTileSelected(null);

		m_$creditsLabel.show();
	}

	this.uninitialize = function () {
		m_$creditsLabel.hide();
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

	var onCreditsChanged = function (value, delta) {
		m_$creditsLabel.text(value);
	}


	var onTurnChanged = function (gameState) {
		if (gameState.currentPlayer && gameState.currentPlayer.type == Player.Types.Human) {
			showCredits();
		} else {
			hideCredits();
		}
	}

	var hideCredits = function () {
		m_$creditsLabel.hide();
	}

	var showCredits = function () {
		m_$creditsLabel.show();
	}
}

ControllerRenderingSystem.TILE_SELECTED_SPRITE_PATH = 'Assets-Scaled/Render/Images/hex_selected.png';

ECS.EntityManager.registerSystem('ControllerRenderingSystem', ControllerRenderingSystem);
SystemsUtils.supplySubscriber(ControllerRenderingSystem);
