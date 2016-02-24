//===============================================
// MainMenu
// Main menu state.
//===============================================
"use strict";

ClientStateManager.registerState(ClientStateManager.types.MainMenu, new function () {
	var self = this;

	var m_$MainMenu = $('#MainMenu').hide();

	var m_$BtnSkirmish = $('#MenuSkirmish');
	var m_$BtnEditor = $('#MenuEditor');

	var m_subscriber = new DOMSubscriber();

	var m_clientState = null;

	this.cleanUp = function () {
		m_$MainMenu.hide();

		m_subscriber.unsubscribeAll();

		if (m_clientState) {
			m_clientState = null;
		}
	};

	this.setup = function (m_loadingScreen) {
		
		m_clientState = {
		};

		m_loadingScreen.hide();

		m_$MainMenu.show();





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