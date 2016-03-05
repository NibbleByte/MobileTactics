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

	var m_currentState = self.States.MainMenu;
	var m_stateDOMs = {};
	var m_stateInitializers = {};
	var m_stateUninitializers = {};

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

	var navigateTo = function (state) {
		hideAllMenus();

		if (m_stateUninitializers[m_currentState]) m_stateUninitializers[m_currentState](state);

		if (m_stateInitializers[state]) m_stateUninitializers[state](m_currentState);

		m_stateDOMs[state].show();

		m_currentState = state;
	}

	var navigateToButtonHandler = function (event) {
		var targetMenu = $(event.currentTarget).attr('NavigateToMenu');

		navigateTo(self.States[targetMenu]);
	}


	//
	// Skirmish
	//
	var selectGameSlotButtonHandler = function (event) {
		self.selectedSaveName = $(event.currentTarget).attr('GameSlotName');

		var saveData = SavesStorage.loadGame(self.selectedSaveName);

		ClientStateManager.changeState(ClientStateManager.types.TestGame, saveData);
	}

	//
	// Init
	//
	var init = function () {

		for(var name in self.States) {
			m_stateDOMs[self.States[name]] = $('#' + name);
		}

		$('[NavigateToMenu]').click(navigateToButtonHandler);
		$('[GameSlotName]').click(selectGameSlotButtonHandler);
	}
	init();




	this.cleanUp = function () {
		hideAllMenus();

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
		navigateTo(self.States.MainMenu);



		// Populate game slot entries
		$('[GameSlotName]').each(function () {
			
			var slotName = $(this).attr('GameSlotName');

			$(this).empty();

			if (SavesStorage.isValidSave(slotName)) {
				var metaData = SavesStorage.loadGameMetaData(slotName);

				var playersDesc = [];
				for(var i = 0; i < metaData.playersData.players.length; ++i) {
					var player = metaData.playersData.players[i];

					if (player.isPlaying) {
						playersDesc.push(Enums.getName(Player.Races, player.race));
					}
				}

				var $name = $('<h3>').text(metaData.gameMetaData.name + ': T' + metaData.gameState.turnsPassed);
				var $playersDesc = $('<div>').text(playersDesc.join(' VS ')).addClass('game_slot_entry_desc');

				$(this)
				.append($name)
				.append($playersDesc);

			} else {
				$(this).append('<h3>Empty</h3>');
			}

		});



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