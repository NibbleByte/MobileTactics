//===============================================
// UITurnChanged
// 
//===============================================
"use strict";

var UITurnChanged = function () {
	var self = this;

	var m_$TurnChangedScreen = $('#TurnChanged');
	var m_$TurnChangedPlayerName = $('#TurnChangedPlayerName');

	var m_subscriber = new DOMSubscriber();

	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._eworldSB.subscribe(GameplayEvents.GameState.VIEWER_CHANGED, onViewerChanged);

		self._eworldSB.subscribe(ClientEvents.UI.STATE_CHANGED, onStateChanged);
	}

	this.uninitialize = function () {
		m_subscriber.unsubscribeAll();
	}


	var onViewerChanged = function (gameState, hasJustLoaded) {

		if (gameState.viewerPlayer) {
			m_$TurnChangedPlayerName.text(gameState.viewerPlayer.name);
		}
	}

	var onStateChanged = function (state) {

		if (state != GameUISystem.States.TurnChanged) {
			m_$TurnChangedScreen.hide();
		} else {
			m_$TurnChangedScreen.show();
		}
	}

	var onTurnChangedReady = function () {
		// Pop is not good enough, cause it might start on Hidden state.
		self._eworld.trigger(ClientEvents.UI.SET_STATE, GameUISystem.States.HUD);
	}


	if (!ClientUtils.isMockUp) {
		m_subscriber.subscribe($('#BtnTurnChangedReady'), 'click', onTurnChangedReady);
	} else {
		m_subscriber.subscribe($('#TurnChanged'), 'click', onTurnChangedReady);
	}
}

ECS.EntityManager.registerSystem('UITurnChanged', UITurnChanged);
SystemsUtils.supplySubscriber(UITurnChanged);
