//===============================================
// MenuScreen
// Main menu state.
//===============================================
"use strict";

ClientStateManager.registerState(ClientStateManager.types.MenuScreen, new function () {
	var self = this;

	var m_$MenuScreen = $('#MenuScreen').hide();

	var m_$BtnSkirmish = $('#MainMenuSkirmish');
	var m_$BtnEditor = $('#MainMenuEditor');

	var m_subscriber = new DOMSubscriber();

	var m_clientState = null;

	this.cleanUp = function () {
		m_$MenuScreen.hide();

		m_subscriber.unsubscribeAll();

		if (m_clientState) {
			m_clientState = null;
		}
	};

	this.setup = function (m_loadingScreen) {
		
		m_clientState = {
		};

		m_loadingScreen.hide();

		m_$MenuScreen.show();





		var onBtnSkirmish = function () {
			currentState = ClientStateManager.changeState(ClientStateManager.types.TestGame);
		}

		var onBtnEditor = function () {
			currentState = ClientStateManager.changeState(ClientStateManager.types.WorldEditor);
		}

		var onBackButton = function () {
			if (Application.tryCancelDialogs())
				return;

			Application.close();
		}


		// Events
		m_subscriber.subscribe(m_$BtnSkirmish, 'click', onBtnSkirmish);
		m_subscriber.subscribe(m_$BtnEditor, 'click', onBtnEditor);

		m_subscriber.subscribe(document, 'backbutton', onBackButton);

		return m_clientState;
	}
});