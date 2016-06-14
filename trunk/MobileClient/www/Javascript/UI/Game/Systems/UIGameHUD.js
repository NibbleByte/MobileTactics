//===============================================
// UIGameHUD
// 
//===============================================
"use strict";

var UIGameHUD = function () {
	var self = this;

	var m_$gameHUD = $('#GameToolbar, #BtnGameMenuContainer');
	var m_$creditsLabel = $('#LbCredits');
	var m_$incomeLabel = $('#LbIncome');
	var m_$gameNextTurn = $('#BtnGameNextTurn');
	var m_$LbPlayerName = $('#LbPlayerName');

	var m_subscriber = new DOMSubscriber();

	var m_gameState = null;
	var m_playersData = null;
	var m_gameMetaData = null;

	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADING, onGameLoading);

		self._eworldSB.subscribe(GameplayEvents.Resources.CURRENT_CREDITS_CHANGED, onCreditsChanged);
		self._eworldSB.subscribe(GameplayEvents.GameState.PLAYERS_VICTORIOUS, onPlayersVictorious);

		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, onTurnChanged);
		self._eworldSB.subscribe(GameplayEvents.GameState.NO_PLAYING_PLAYERS, onTurnChanged);

		self._eworldSB.subscribe(ClientEvents.UI.STATE_CHANGED, onStateChanged);
	}

	this.uninitialize = function () {
		m_$gameHUD.hide();

		m_subscriber.unsubscribeAll();
	}


	var onGameLoading = function () {
		m_gameState = self._eworld.extract(GameState);
		m_playersData = self._eworld.extract(PlayersData);
		m_gameMetaData = self._eworld.extract(GameMetaData);

		m_$creditsLabel.text('-');
		m_$incomeLabel.text('-');
		m_$gameNextTurn.prop('disabled', m_gameState.winners.length != 0);
	}


	var onCreditsChanged = function (value, delta) {
		m_$creditsLabel.text(value);
		m_$incomeLabel.text('+' + m_gameState.currentIncome);
	}

	var onPlayersVictorious = function (winners) {
		onGameLoading();

		var winnersNames = [];
		for(var i = 0; i < winners.length; ++i) {
			winnersNames.push(winners[i].name);
		}

		PopUpManager.show({
			title: 'Victory',
			message: 'Congratulations! <br />' + winnersNames.join(', ') + ' <br /> You are victoious!',
			buttons: ['Yeah!'],
		});
	}

	var onTurnChanged = function () {
		var player = m_gameState.currentPlayer;

		if (player) {
			m_$LbPlayerName.text(player.name);
		} else {
			m_$LbPlayerName.text('N/a');
		}
	}




	var show = function () {
		m_$gameHUD.show();
	}

	var hide = function () {
		m_$gameHUD.hide();
	}

	var onStateChanged = function (state) {

		if (state != GameUISystem.States.HUD) {
			hide();
		} else {
			show();
		}
	}


	var onNextTurn = function () {
		self._eworld.trigger(GameplayEvents.GameState.END_TURN);
	}

	var onMenu = function () {
		self._eworld.trigger(ClientEvents.UI.PUSH_STATE, GameUISystem.States.Menu);
	}


	m_subscriber.subscribe(m_$gameNextTurn, 'click', onNextTurn);
	m_subscriber.subscribe($('#BtnGameMenu'), 'click', onMenu);
}

ECS.EntityManager.registerSystem('UIGameHUD', UIGameHUD);
SystemsUtils.supplySubscriber(UIGameHUD);
