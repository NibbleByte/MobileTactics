//===============================================
// UIGameMenu
// 
//===============================================
"use strict";

var UIGameMenu = function () {
	var self = this;

	var m_$MenuScreen = $('#GameMenu').hide();
	var m_$MenuContainer = $('#GameMenuContainer');
	var m_$MenuBlocker = $('#GameMenu .dialog_blocker');
	var MENU_HEIGHT = m_$MenuContainer.height();
	var MENU_GROUP_3_HEIGHT = 32;

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


	var updateMenuPosition = function (tween) {
		if (self._eworld.blackboard[ClientBlackBoard.UI.CURRENT_STATE] != tween.workingState) {
			Tweener.cancel(tween.tweenHandle);
			return;
		}

		m_$MenuContainer.css('top', Math.round(-tween.top));
	}

	var showIn = function () {
		m_$MenuScreen.show();
		m_$MenuBlocker.show();

		var tween = { top: MENU_HEIGHT - MENU_GROUP_3_HEIGHT, workingState: self._eworld.blackboard[ClientBlackBoard.UI.CURRENT_STATE] };

		tween.tweenHandle = 
			Tweener.addTween(tween, {top: 0, time: 0.75, delay: 0, transition: 'easeOutQuint', onUpdate: updateMenuPosition, onUpdateParams: [ tween ]});
	}

	var hideOut = function () {
		m_$MenuScreen.show();
		m_$MenuBlocker.hide();

		var tween = { top: 0, workingState: self._eworld.blackboard[ClientBlackBoard.UI.CURRENT_STATE] };

		tween.tweenHandle = 
			Tweener.addTween(tween, {top: MENU_HEIGHT - MENU_GROUP_3_HEIGHT, time: 0.75, delay: 0, transition: 'easeOutExpo', onUpdate: updateMenuPosition, onUpdateParams: [ tween ]});
	}

	var hideInit = function () {
		m_$MenuContainer.css('top', -(MENU_HEIGHT - MENU_GROUP_3_HEIGHT));
		m_$MenuScreen.show();
		m_$MenuBlocker.hide();
	}

	var show = function () {
		m_$MenuScreen.show();
		m_$MenuBlocker.show();
		m_$MenuContainer.css('top', 0);
	}

	var hide = function () {
		m_$MenuScreen.hide();
		m_$MenuBlocker.hide();
	}

	var onStateChanged = function (state, prevState) {

		if (state != GameUISystem.States.Menu) {
			if (state == GameUISystem.States.HUD && prevState == GameUISystem.States.Menu) {
				hideOut();
			} else if (state == GameUISystem.States.HUD) {
				hideInit();
			} else {
				hide();
			}
		} else {
			if (prevState == GameUISystem.States.HUD) {
				showIn();
			} else {
				show();
			}
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

	var onMenu = function () {
		if (self._eworld.blackboard[ClientBlackBoard.UI.CURRENT_STATE] == GameUISystem.States.Menu) {
			self._eworld.trigger(ClientEvents.UI.POP_STATE);
		} else {
			self._eworld.trigger(ClientEvents.UI.PUSH_STATE, GameUISystem.States.Menu);
		}
	}

	m_subscriber.subscribe($('#BtnGameMenuReturn'), 'click', onReturn);
	m_subscriber.subscribe($('#BtnGameMenuUnitInfo'), 'click', onUnitsInfo);
	m_subscriber.subscribe($('#BtnGameMenuGameStateInfo'), 'click', onGameStateInfo);
	m_subscriber.subscribe($('#BtnGameMenuQuit'), 'click', onQuit);

	m_subscriber.subscribe($('#BtnGameMenuToggle'), 'click', onMenu);
}

ECS.EntityManager.registerSystem('UIGameMenu', UIGameMenu);
SystemsUtils.supplySubscriber(UIGameMenu);
