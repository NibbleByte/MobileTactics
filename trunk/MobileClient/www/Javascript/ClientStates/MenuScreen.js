//===============================================
// MenuScreen
// Main menu state.
//===============================================
"use strict";

var MenuScreenState = new function () {
	var self = this;

	this.selectedSaveName = '';
	this.States = {
		MainMenu: 0,
		SkirmishMenu: 0,
	}
	Enums.enumerate(this.States);

	this.currentState = self.States.MainMenu;

	this.stateInitializers = {};
	this.stateUninitializers = {};


	var m_stateDOMs = {};
	var m_$MenuScreen = $('#MenuScreen').hide();

	var m_$BtnEditor = $('#MainMenuEditor');

	var m_subscriber = new DOMSubscriber();

	var m_clientState = null;


	//
	// Navigation
	//
	var hideAllMenus = function () {
		for(var name in self.States) {
			m_stateDOMs[self.States[name]].hide();
		}
	}

	this.navigateTo = function (state) {
		hideAllMenus();

		if (self.stateUninitializers[self.currentState]) self.stateUninitializers[self.currentState](state);

		if (self.stateInitializers[state]) self.stateInitializers[state](self.currentState);

		m_stateDOMs[state].show();

		self.currentState = state;
	}

	var navigateToButtonHandler = function (event) {
		var targetMenu = $(event.currentTarget).attr('NavigateToMenu');

		self.navigateTo(self.States[targetMenu]);
	}

	//
	// Init
	//
	var init = function () {

		for(var name in self.States) {
			m_stateDOMs[self.States[name]] = $('#' + name);
		}

		$('[NavigateToMenu]').click(navigateToButtonHandler);
	}
	init();




	this.cleanUp = function () {
		hideAllMenus();

		m_$MenuScreen.hide();

		m_subscriber.unsubscribeAll();

		$(self).trigger('cleanUp');

		if (m_clientState) {
			m_clientState = null;
		}
	};

	this.setup = function (m_loadingScreen) {
		
		m_clientState = {
		};

		m_loadingScreen.hide();

		m_$MenuScreen.show();
		self.navigateTo(self.States.MainMenu);

		$(self).trigger('setup');

		var onBtnEditor = function () {
			ClientStateManager.changeState(ClientStateManager.types.WorldEditor);
		}

		var onBackButton = function () {
			if (Application.tryCancelDialogs())
				return;

			Application.close();
		}


		// Events
		m_subscriber.subscribe(m_$BtnEditor, 'click', onBtnEditor);

		m_subscriber.subscribe(document, 'backbutton', onBackButton);

		return m_clientState;
	}
};

ClientStateManager.registerState(ClientStateManager.types.MenuScreen, MenuScreenState);