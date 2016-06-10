//===============================================
// ControllerRenderingSystem
// Handles tile rendering.
//===============================================
"use strict";

var ControllerRenderingSystem = function (m_renderer) {
	var self = this;
	
	console.assert(m_renderer instanceof SceneRenderer, "SceneRenderer is required.");
	
	var m_selectedSprite = null;

	var m_subscriber = new DOMSubscriber();

	//
	// Entity system initialize
	//
	this.initialize = function () {
		
		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADED, showHUD);

		self._eworldSB.subscribe(ClientEvents.Controller.TILE_SELECTED, onTileSelected);

		self._eworldSB.subscribe(GameplayEvents.GameState.VIEWER_CHANGED, onViewerChanged);

		self._eworldSB.subscribe(AIEvents.Simulation.SIMULATION_FINISHED, showAI);

		self._eworldSB.subscribe(RenderEvents.FightAnimations.FIGHT_STARTED, pushHidden);
		self._eworldSB.subscribe(RenderEvents.FightAnimations.FIGHT_FINISHED, popHidden);

		self._eworldSB.subscribe(ClientEvents.UI.LOCK_GAME_HUD, onHudLockRefresh);

		m_selectedSprite = m_renderer.createSprite(WorldLayers.LayerTypes.Selection, ControllerRenderingSystem.TILE_SELECTED_SPRITE_PATH)
		.size(GTile.TILE_WIDTH, GTile.TILE_HEIGHT);

		onTileSelected(null);

		pushHidden();
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
			self._eworld.trigger(ClientEvents.UI.SET_STATE, GameUISystem.States.TurnChanged);
		}
	}

	var onHudLockRefresh = function (lock) {

		if (lock) {
			pushHidden();
		} else {
			popHidden();
		}
	}


	var pushHidden = function () {
		self._eworld.trigger(ClientEvents.UI.PUSH_STATE_CHECK, GameUISystem.States.Hidden);
	}
	var popHidden = function () {

		if (self._eworld.blackboard[ClientBlackBoard.UI.CURRENT_STATE] != GameUISystem.States.Hidden)
			return;

		self._eworld.trigger(ClientEvents.UI.POP_STATE);
	}


	var showHUD = function () {
		self._eworld.trigger(ClientEvents.UI.SET_STATE, GameUISystem.States.HUD);
	}

	var showAI = function () {
		self._eworld.trigger(ClientEvents.UI.SET_STATE, GameUISystem.States.AI);
	}

	m_subscriber.subscribe(StoreScreen, StoreScreen.Events.STORE_SHOWN, pushHidden);
	m_subscriber.subscribe(StoreScreen, StoreScreen.Events.STORE_HIDE, popHidden);
}

ControllerRenderingSystem.TILE_SELECTED_SPRITE_PATH = 'Assets-Scaled/Render/Images/hex_selected.png';

ECS.EntityManager.registerSystem('ControllerRenderingSystem', ControllerRenderingSystem);
SystemsUtils.supplySubscriber(ControllerRenderingSystem);
