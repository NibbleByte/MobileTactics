//===============================================
// GameToolbarSystem
// 
//===============================================
"use strict";

var GameToolbarSystem = function () {
	var self = this;
	
	var m_selectedSprite = null;
	var m_$gameToolbar = $('#GameToolbar');
	var m_$creditsLabel = $('#LbCredits');

	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._eworldSB.subscribe(GameplayEvents.Resources.CURRENT_CREDITS_CHANGED, onCreditsChanged);
		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, onTurnChanged);

		self._eworldSB.subscribe(RenderEvents.FightAnimations.FIGHT_STARTED, hideCredits);
		self._eworldSB.subscribe(RenderEvents.FightAnimations.FIGHT_FINISHED, showCredits);

		m_$gameToolbar.show();
	}

	this.uninitialize = function () {
		m_$gameToolbar.hide();
	}

	var onCreditsChanged = function (value, delta) {
		m_$creditsLabel.text(value);
	}


	var onTurnChanged = function (gameState) {
		if (gameState.currentPlayer && gameState.currentPlayer.type == Player.Types.Human) {
			showCredits();
		} else {
			hideCredits();
		}
	}

	var hideCredits = function () {
		m_$gameToolbar.hide();
	}

	var showCredits = function () {
		m_$gameToolbar.show();
	}


	var onNextTurn = function () {
		self._eworld.trigger(GameplayEvents.GameState.END_TURN);
	}

	var onQuit = function () {
		ClientStateManager.changeState(ClientStateManager.types.MenuScreen);
	}



	$('#BtnGameNextTurn').click(onNextTurn);
	$('#BtnGameQuit').click(onQuit);
}

ECS.EntityManager.registerSystem('GameToolbarSystem', GameToolbarSystem);
SystemsUtils.supplySubscriber(GameToolbarSystem);
