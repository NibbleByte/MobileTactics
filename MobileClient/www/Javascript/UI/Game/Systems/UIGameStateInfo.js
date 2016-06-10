//===============================================
// UIGameStateInfo
// 
//===============================================
"use strict";

var UIGameStateInfo = function () {
	var self = this;

	var m_$gameStateInfoScreen = $('#GameStateInfo').hide();
	var m_$gameStateInfoStatisticsTable = $('#GameStateInfoTable > tbody');
	var m_$gameStateInfoPlayersTable = $('#GameStateInfoPlayersTable > tbody');

	var m_subscriber = new DOMSubscriber();

	var m_gameState = null;
	var m_playersData = null;
	var m_gameMetaData = null;

	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADING, onGameLoading);

		self._eworldSB.subscribe(ClientEvents.UI.STATE_CHANGED, onStateChanged);
	}

	this.uninitialize = function () {
		m_subscriber.unsubscribeAll();
	}


	var onGameLoading = function () {
		m_gameState = self._eworld.extract(GameState);
		m_playersData = self._eworld.extract(PlayersData);
		m_gameMetaData = self._eworld.extract(GameMetaData);
	}


	//
	// Game State Info
	//
	var show = function () {

		//
		// Stats
		//
		var player = m_gameState.currentPlayer;
		if (!player)
			player = m_playersData.players[0];

		var incomeCount = 0;

		incomeCount += m_gameState.currentStructuresTypes[GameWorldTerrainType.Base].length;
		incomeCount += m_gameState.currentStructuresTypes[GameWorldTerrainType.Minerals].length;

		m_$gameStateInfoStatisticsTable.empty();

		RenderUtils.appendRow('Map', m_gameMetaData.name, m_$gameStateInfoStatisticsTable);
		RenderUtils.appendRow('Custom', m_gameState.isCustomMap, m_$gameStateInfoStatisticsTable);
		RenderUtils.appendRow('Turns', m_gameState.turnsPassed, m_$gameStateInfoStatisticsTable);
		RenderUtils.appendRow('Bases', incomeCount, m_$gameStateInfoStatisticsTable);
		RenderUtils.appendRow('Credits/Base', player.creditsPerIncome, m_$gameStateInfoStatisticsTable);
		RenderUtils.appendRow('Credits/Turn', incomeCount * player.creditsPerIncome, m_$gameStateInfoStatisticsTable);


		//
		// Players
		//
		m_$gameStateInfoPlayersTable.empty();

		for(var i = 0; i < m_playersData.players.length; ++i) {
			var player = m_playersData.players[i];

			var team = (player.teamId == -1) ? '-' : String.fromCharCode(65 + player.teamId);
			var type = $('<td>').append($('<input>', {
				type: 'checkbox', 
				disabled: true, 
				checked: player.type == Player.Types.AI,
			}));


			$('<tr>')
			.append('<td>' + player.name + '</td>')
			.append('<td>' + Enums.getName(Player.Races, player.race) + '</td>')
			.append('<td>' + team + '</td>')
			.append(type)
			.addClass((player.isPlaying) ? 'player_playing' : 'player_not_playing' )
			.appendTo(m_$gameStateInfoPlayersTable);
		}

		m_$gameStateInfoScreen.show();
	}

	var hide = function () {
		m_$gameStateInfoScreen.hide();
	}

	var onStateChanged = function (state) {

		if (state != GameUISystem.States.GameStateInfo) {
			hide();
		} else {
			show();
		}
	}

	var onGameStateInfoClose = function () {
		self._eworld.trigger(ClientEvents.UI.POP_STATE);
	}


	m_subscriber.subscribe($('#BtnGameStateInfoClose'), 'click', onGameStateInfoClose);
}

ECS.EntityManager.registerSystem('UIGameStateInfo', UIGameStateInfo);
SystemsUtils.supplySubscriber(UIGameStateInfo);
