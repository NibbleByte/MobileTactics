//===============================================
// SkirmishScreen
// 
//===============================================
"use strict";

var SkirmishScreen = new function () {
	var self = this;

	var selectGameSlotButtonHandler = function (event) {
		MenuScreenState.selectedSaveName = $(event.currentTarget).attr('GameSlotName');

		var saveData = SavesStorage.loadGame(MenuScreenState.selectedSaveName);

		if (!saveData) {
			MenuScreenState.navigateTo(MenuScreenState.States.SkirmishMapSelect);

		} else {
			ClientStateManager.changeState(ClientStateManager.types.TestGame, saveData);
		}
	}


	var cleanUp = function () {
	};

	var setup = function () {


		//
		// Populate game slot entries
		//
		$('[GameSlotName]').each(function () {

			var slotName = $(this).attr('GameSlotName');

			$(this).empty();

			if (SavesStorage.isValidSave(slotName)) {
				var metaData = SavesStorage.loadGameMetaData(slotName);

				var playersDesc = [];
				for (var i = 0; i < metaData.playersData.players.length; ++i) {
					var player = metaData.playersData.players[i];

					if (player.isPlaying) {
						playersDesc.push(Enums.getName(Player.Races, player.race));
					}
				}

				var date = new Date(metaData.gameMetaData.lastPlayed);
				date = date.toLocaleDateString() + '<br />' + date.getHours() + ':' + date.getMinutes();

				var $name = $('<h3>').text(metaData.gameMetaData.name + ': T' + metaData.gameState.turnsPassed);
				var $date = $('<div>').html(date).addClass('game_slot_entry_date_played');
				var $playersDesc = $('<div>').text(playersDesc.join(' VS ')).addClass('game_slot_entry_desc');

				$(this)
				.append($name)
				.append($date)
				.append($playersDesc);

			} else {
				$(this).append('<h3>Empty</h3>');
			}

		});

	}


	//
	// Map Selector
	//

	var m_currentlySelectedMapIndex = -1;
	var m_currentlySelectedMapRowData = '';
	var m_$MapSelectName = $('#SkirmishMapSelectName');
	var m_$MapSelectCustomMap = $('#SkirmishMapSelectCustomMap');
	var m_$MapSelectInfo = $('#SkirmishMapSelectInfo');


	var stateMapSelectInit = function (prevState) {
		if (m_currentlySelectedMapIndex == -1)
			onNextMap();
	}

	var showMap = function (rawData) {
		
		m_currentlySelectedMapRowData = rawData;

		var data = Serialization.deserialize(m_currentlySelectedMapRowData);

		m_$MapSelectName.text(data.gameMetaData.name);
		m_$MapSelectCustomMap.toggle(data.gameState.isCustomMap);
		
		var playersCount = data.playersData.players.length;
		var credits = data.playersData.players[0].credits;
		var creditsPerMine = data.playersData.players[0].creditsPerMine;

		m_$MapSelectInfo
		.empty()
		.append($('<div>').text('Players: ' + playersCount))
		.append($('<div>').text('Initial Credits:' + credits))
		.append($('<div>').text('Credits/Base:' + creditsPerMine))
		;
	}

	var onNextMap = function () {
		m_currentlySelectedMapIndex = (m_currentlySelectedMapIndex + 1) % MapsStorage.maps.length;

		var mapName = MapsStorage.maps[m_currentlySelectedMapIndex];

		MapsStorage.loadMap(mapName, showMap, onNextMap);
	}

	var onPrevMap = function () {
		m_currentlySelectedMapIndex--;

		if (m_currentlySelectedMapIndex < 0) m_currentlySelectedMapIndex += MapsStorage.maps.length;

		var mapName = MapsStorage.maps[m_currentlySelectedMapIndex];

		MapsStorage.loadMap(mapName, showMap, onPrevMap);
	}

	var onPlayMap = function () {
		ClientStateManager.changeState(ClientStateManager.types.TestGame, m_currentlySelectedMapRowData);
	}

	//
	// Init
	//
	var init = function () {
		$(MenuScreenState).on('CLEANUP', cleanUp);
		$(MenuScreenState).on('SETUP', setup);

		MenuScreenState.stateInitializers[MenuScreenState.States.SkirmishMapSelect] = stateMapSelectInit;

		$('[GameSlotName]').click(selectGameSlotButtonHandler);

		$('#SkirmishMapSelectNext').click(onNextMap);
		$('#SkirmishMapSelectPrev').click(onPrevMap);
		$('#SkirmishMapSelectPlay').click(onPlayMap);
	}
	$(init);
};
