//===============================================
// UIGameHUD
// 
//===============================================
"use strict";

var UIGameHUD = function () {
	var self = this;

	var m_$gameHUD = $('#GameToolbar');
	var m_$creditsLabel = $('#LbCredits');
	var m_$incomeLabel = $('#LbIncome');
	var m_$gameNextTurn = $('#BtnGameNextTurn');
	var m_$creditsContainer = $('#PlayerCreditsContainer');
	var m_$LbPlayerName = $('#LbPlayerName');

	var SIDE_BUTTONS_WIDTH = m_$gameNextTurn.width();
	var BOTTOM_NAME_HEIGHT = m_$LbPlayerName.height();

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


	var updateButtonsPosition = function (tween) {
		if (self._eworld.blackboard[ClientBlackBoard.UI.CURRENT_STATE] != tween.workingState) {
			Tweener.cancel(tween.tweenHandle);
			return;
		}

		m_$LbPlayerName.css('bottom', Math.round(-tween.bottomNameY));
		m_$gameNextTurn.css('right', Math.round(-tween.sideButtonsX));
		m_$creditsContainer.css('left', Math.round(-tween.sideButtonsX));
	}

	var updateButtonsComplete = function () {
		m_$gameHUD.hide();
	}

	var showIn = function () {
		if (AnimationSystem.currentTweenOwner == null) {
			show();
			return;
		}

		m_$gameHUD.show();

		var tween = {
			bottomNameY: BOTTOM_NAME_HEIGHT,
			sideButtonsX: SIDE_BUTTONS_WIDTH,
			workingState: self._eworld.blackboard[ClientBlackBoard.UI.CURRENT_STATE]
		};

		tween.tweenHandle = 
			Tweener.addTween(tween, {bottomNameY: 0, sideButtonsX: 0, time: 0.75, delay: 0, transition: 'easeOutQuint', onUpdate: updateButtonsPosition, onUpdateParams: [ tween ]});
	}

	var show = function () {
		m_$gameHUD.show();

		m_$LbPlayerName.css('bottom', 0);
		m_$gameNextTurn.css('right', 0);
		m_$creditsContainer.css('left', 0);
	}

	var hide = function () {
		m_$gameHUD.hide();
	}

	var hideOut = function () {
		if (AnimationSystem.currentTweenOwner == null) {
			hide();
			return;
		}

		var tween = {
			bottomNameY: 0,
			sideButtonsX: 0,
			workingState: self._eworld.blackboard[ClientBlackBoard.UI.CURRENT_STATE]
		};

		tween.tweenHandle = 
			Tweener.addTween(tween, {bottomNameY: BOTTOM_NAME_HEIGHT, sideButtonsX: SIDE_BUTTONS_WIDTH, time: 0.75, delay: 0, transition: 'easeOutQuint', onUpdate: updateButtonsPosition, onUpdateParams: [ tween ], onComplete: updateButtonsComplete});
	}

	var onStateChanged = function (state, prevState) {

		if (state != GameUISystem.States.HUD) {
			if (state == GameUISystem.States.Menu) {
				hideOut();
			} else {
				hide();
			}
		} else {
			if (prevState == GameUISystem.States.Menu) {
				showIn();
			} else {
				show();
			}
		}
	}


	var onNextTurn = function () {
		self._eworld.trigger(GameplayEvents.GameState.END_TURN);
	}


	m_subscriber.subscribe(m_$gameNextTurn, 'click', onNextTurn);
}

ECS.EntityManager.registerSystem('UIGameHUD', UIGameHUD);
SystemsUtils.supplySubscriber(UIGameHUD);
