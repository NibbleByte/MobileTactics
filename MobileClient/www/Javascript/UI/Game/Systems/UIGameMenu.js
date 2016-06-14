//===============================================
// UIGameMenu
// 
//===============================================
"use strict";

var UIGameMenu = function () {
	var self = this;

	var m_$MenuScreen = $('#GameMenu').hide();

	var m_subscriber = new DOMSubscriber();

	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._eworldSB.subscribe(ClientEvents.UI.STATE_CHANGED, onStateChanged);
	}

	this.uninitialize = function () {
		m_subscriber.unsubscribeAll();
		hide();
	}


	var show = function () {
		m_$MenuScreen.show();
	}

	var hide = function () {
		m_$MenuScreen.hide();
	}

	var onStateChanged = function (state) {

		if (state != GameUISystem.States.Menu) {
			hide();
		} else {
			show();
		}
	}

	var onReturn = function () {
		self._eworld.trigger(ClientEvents.UI.POP_STATE);
	}

	var onUnitsInfo = function () {
		self._eworld.trigger(ClientEvents.UI.PUSH_STATE, GameUISystem.States.UnitInfo);
	}

	var onGameStateInfo = function () {
		self._eworld.trigger(ClientEvents.UI.PUSH_STATE, GameUISystem.States.GameStateInfo);
	}

	var onQuit = function () {
		ClientStateManager.changeState(ClientStateManager.types.MenuScreen);
	}

	m_subscriber.subscribe($('#BtnGameMenuReturn, #BtnGameMenuReturnSecondary'), 'click', onReturn);
	m_subscriber.subscribe($('#BtnGameMenuUnitInfo'), 'click', onUnitsInfo);
	m_subscriber.subscribe($('#BtnGameMenuGameStateInfo'), 'click', onGameStateInfo);
	m_subscriber.subscribe($('#BtnGameMenuQuit'), 'click', onQuit);
}

ECS.EntityManager.registerSystem('UIGameMenu', UIGameMenu);
SystemsUtils.supplySubscriber(UIGameMenu);
