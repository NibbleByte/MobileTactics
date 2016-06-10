//===============================================
// UIGameHUD
// 
//===============================================
"use strict";

var UIGameHUD = function () {
	var self = this;

	var m_$gameToolbar = $('#GameToolbar');
	var m_$creditsLabel = $('#LbCredits');
	var m_$gameNextTurn = $('#BtnGameNextTurn');

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

		self._eworldSB.subscribe(ClientEvents.UI.STATE_CHANGED, onStateChanged);
	}

	this.uninitialize = function () {
		m_$gameToolbar.hide();

		m_subscriber.unsubscribeAll();
	}


	var onGameLoading = function () {
		m_gameState = self._eworld.extract(GameState);
		m_playersData = self._eworld.extract(PlayersData);
		m_gameMetaData = self._eworld.extract(GameMetaData);

		m_$creditsLabel.text('-');
		m_$gameNextTurn.prop('disabled', m_gameState.winners.length != 0);
	}


	var onCreditsChanged = function (value, delta) {
		m_$creditsLabel.text(value);
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


	var show = function () {
		m_$gameToolbar.show();
	}

	var hide = function () {
		m_$gameToolbar.hide();
	}

	var onStateChanged = function (state) {

		if (state != GameUISystem.States.HUD) {
			hide();
		} else {
			show();
		}
	}


	var onUnitsInfo = function () {
		self._eworld.trigger(ClientEvents.UI.PUSH_STATE, GameUISystem.States.UnitInfo);
	}

	var onGameStateInfo = function () {
		self._eworld.trigger(ClientEvents.UI.PUSH_STATE, GameUISystem.States.GameStateInfo);
	}

	var onNextTurn = function () {
		self._eworld.trigger(GameplayEvents.GameState.END_TURN);
	}

	var onQuit = function () {
		ClientStateManager.changeState(ClientStateManager.types.MenuScreen);
	}


	m_subscriber.subscribe($('#BtnGameUnitInfo'), 'click', onUnitsInfo);
	m_subscriber.subscribe($('#BtnGameStateInfo'), 'click', onGameStateInfo);
	m_subscriber.subscribe(m_$gameNextTurn, 'click', onNextTurn);
	m_subscriber.subscribe($('#BtnGameQuit'), 'click', onQuit);
}

ECS.EntityManager.registerSystem('UIGameHUD', UIGameHUD);
SystemsUtils.supplySubscriber(UIGameHUD);
