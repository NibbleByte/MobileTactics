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
		m_previewMaker.cleanUp();
		m_currentlySelectedMapIndex = -1;
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


		m_previewMaker.setup();
	}


	//
	// Map Selector
	//

	var m_currentlySelectedMapIndex = -1;
	var m_currentlySelectedMapRowData = '';
	var m_$MapSelectName = $('#SkirmishMapSelectName');
	var m_$MapSelectCustomMap = $('#SkirmishMapSelectCustomMap');
	var m_$MapSelectInfo = $('#SkirmishMapSelectInfo');

	var m_$GameWorldMapPreview = $('#GameWorldMapPreview');
	var m_$GameWorldMapPreviewLoading = $('#GameWorldMapPreviewLoading').hide();

	var m_previewMaker = new MapPreviewMaker(m_$GameWorldMapPreview, m_$GameWorldMapPreviewLoading);
	var m_isMapLoading = false;


	var stateMapSelectInit = function (prevState) {
		if (m_currentlySelectedMapIndex == -1)
			onNextMap();
	}

	var showMap = function (rawData) {
		
		m_currentlySelectedMapRowData = rawData;

		m_isMapLoading = true;

		m_$GameWorldMapPreviewLoading.show();

		setTimeout(onLoadingShown, 150);
	}

	var onLoadingShown = function () {
		
		m_isMapLoading = false;

		m_$GameWorldMapPreviewLoading.hide();

		m_previewMaker.loadPreview(m_currentlySelectedMapRowData);

		var previewState = m_previewMaker.getPreviewState();

		m_configurePlayersData = previewState.playersData;
		m_isCustomMap = previewState.gameState.isCustomMap;

		m_$MapSelectName.text(previewState.gameMetaData.name);
		m_$MapSelectCustomMap.toggle(previewState.gameState.isCustomMap);
		
		var playersCount = previewState.playersData.players.length;
		var credits = previewState.playersData.players[0].credits;
		var creditsPerMine = previewState.playersData.players[0].creditsPerMine;

		m_$MapSelectInfo
		.empty()
		.append($('<div>').text('Players: ' + playersCount))
		.append($('<div>').text('Initial Credits:' + credits))
		.append($('<div>').text('Credits/Base:' + creditsPerMine))
		;
	}

	var onNextMap = function () {
		if (m_isMapLoading)
			return;

		m_currentlySelectedMapIndex = (m_currentlySelectedMapIndex + 1) % MapsStorage.maps.length;

		var mapName = MapsStorage.maps[m_currentlySelectedMapIndex];

		MapsStorage.loadMap(mapName, showMap, onNextMap);
	}

	var onPrevMap = function () {
		if (m_isMapLoading)
			return;

		m_currentlySelectedMapIndex--;

		if (m_currentlySelectedMapIndex < 0) m_currentlySelectedMapIndex += MapsStorage.maps.length;

		var mapName = MapsStorage.maps[m_currentlySelectedMapIndex];

		MapsStorage.loadMap(mapName, showMap, onPrevMap);
	}

	var onSelectMap = function () {
		if (m_isMapLoading)
			return;

		MenuScreenState.navigateTo(MenuScreenState.States.SkirmishGameConfigure);
	}



	//
	// Map Configure
	//
	var m_$gameConfigureTableBody = $('#SkirmishGameConfigurePlayers > tbody');
	var m_$SkirmishGameConfigureCustomMap = $('#SkirmishGameConfigureCustomMap');
	var m_isCustomMap = false;
	var m_configurePlayersData = null;
	var m_configurePlayersControls = null;

	var stateGameConfigureInit = function (prevState) {

		m_$gameConfigureTableBody.empty();
		m_configurePlayersControls = [];

		for(var i = 0; i < m_configurePlayersData.players.length; ++i) {
			var player = m_configurePlayersData.players[i];

			var controls = { playerId: player.playerId };

			var $tr = $('<tr />').appendTo(m_$gameConfigureTableBody);

			$('<td />')
			.text('Player ' + (i + 1))
			.appendTo($tr);


			//
			// Race
			//
			var $select = $('<select>', { disabled: m_isCustomMap });
			$('<option />', {value: -1, text: 'None' }).appendTo($select);

			for(var raceName in Player.Races) {

				if (raceName == 'Developers') continue;
				var race = Player.Races[raceName];
				var selected = (m_isCustomMap && race == player.race) || (!m_isCustomMap && race == Player.Races.Empire);

				$('<option />', {value: race, text: raceName, selected: selected })
				.appendTo($select);
			}

			$('<td />')
			.append($select)
			.appendTo($tr);

			controls.$raceSelect = $select;


			//
			// Team
			//
			var $select = $('<select>', { disabled: m_isCustomMap });
			$('<option />', { value: -1, text: '-', selected: m_isCustomMap && player.teamId == -1}).appendTo($select);
			$('<option />', { value: 0, text: 'A', selected: m_isCustomMap && player.teamId == 0}).appendTo($select);
			$('<option />', { value: 1, text: 'B', selected: m_isCustomMap && player.teamId == 1}).appendTo($select);
			$('<option />', { value: 2, text: 'C', selected: m_isCustomMap && player.teamId == 2}).appendTo($select);
			$('<option />', { value: 3, text: 'D', selected: m_isCustomMap && player.teamId == 3}).appendTo($select);

			$('<td />')
			.append($select)
			.appendTo($tr);

			controls.$teamSelect = $select;


			//
			// AI
			//
			var $checkbox = $('<input>', {
				type: 'checkbox', 
				disabled: m_isCustomMap, 
				checked: m_isCustomMap && player.type == Player.Types.AI,
			});

			$('<td />')
			.append($checkbox)
			.appendTo($tr);

			controls.$aiCheckbox = $checkbox;


			m_configurePlayersControls.push(controls);
			m_$SkirmishGameConfigureCustomMap.toggle(m_isCustomMap);
		}
	}

	var onConfigurePlay = function () {
		
		if (m_isCustomMap) {
			var playersReplacements = m_configurePlayersData.players;
		} else {
			
			var playersReplacements = [];
			for(var i = 0; i < m_configurePlayersControls.length; ++i) {
				var controls = m_configurePlayersControls[i];
				var player = m_configurePlayersData.getPlayer(controls.playerId);

				player.race = parseInt(controls.$raceSelect.val());
				player.teamId = parseInt(controls.$teamSelect.val());
				player.type = (controls.$aiCheckbox.prop('checked')) ? Player.Types.AI : Player.Types.Human;

				if (player.race == -1) {
					player.race = Player.Races.Empire;
					player.isPlaying = false;
				}

				playersReplacements.push(player);
			}
		}

		ClientStateManager.changeState(ClientStateManager.types.TestGame, m_currentlySelectedMapRowData, playersReplacements);
	}

	//
	// Init
	//
	var init = function () {
		$(MenuScreenState).on('CLEANUP', cleanUp);
		$(MenuScreenState).on('SETUP', setup);

		MenuScreenState.stateInitializers[MenuScreenState.States.SkirmishMapSelect] = stateMapSelectInit;
		MenuScreenState.stateInitializers[MenuScreenState.States.SkirmishGameConfigure] = stateGameConfigureInit;

		$('[GameSlotName]').click(selectGameSlotButtonHandler);

		$('#SkirmishMapSelectNext').click(onNextMap);
		$('#SkirmishMapSelectPrev').click(onPrevMap);
		$('#SkirmishMapSelectPlay').click(onSelectMap);

		$('#SkirmishGameConfigurePlay').click(onConfigurePlay);
	}
	$(init);
};
