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

		ClientStateManager.changeState(ClientStateManager.types.TestGame, saveData);
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




	var init = function () {
		$(MenuScreenState).on('CLEANUP', cleanUp);
		$(MenuScreenState).on('SETUP', setup);

		$('[GameSlotName]').click(selectGameSlotButtonHandler);
	}
	$(init);
};
