//===============================================
// EditorController
// User control in the editor.
//===============================================
"use strict";

var EditorGamePropertiesController = function (m_editorController, m_renderer) {
	var self = this;
	
	var m_$GameProps = $('#GamePropsEditor');
	var m_$GamePropsName = $('#GamePropsNameEditor');
	var m_$GamePropsDescription = $('#GamePropsDescriptionEditor');
	var m_$GamePropsWidth = $('#GamePropsWidthEditor');
	var m_$GamePropsHeight = $('#GamePropsHeightEditor');
	var m_$GamePropsLockSizes = $('#GamePropsLockSizesEditor');
	var m_$GamePropsStartingCredits = $('#GamePropsStartingCreditsEditor');
	var m_$GamePropsCreditsPerMine = $('#GamePropsCreditsPerMineEditor');

	var m_subscriber = new DOMSubscriber();

	var m_gameState = null;
	var m_playersData = null;

	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADING, onGameLoading);

		m_subscriber.subscribe($('#BtnGamePropsEditor'), 'click', onGameProps);

		m_subscriber.subscribe($('#BtnGamePropsApply'), 'click', onBtnApply);
		m_subscriber.subscribe($('#BtnGamePropsCancel'), 'click', onBtnCancel);

		self._eworld.blackboard[EditorBlackBoard.Properties.LOCK_SIZES] = false;
	};
	
	this.uninitialize = function () {
		m_subscriber.unsubscribeAll();
	};

	var onGameLoading = function () {
		m_gameState = self._eworld.extract(GameState);
		m_playersData = self._eworld.extract(PlayersData);
	}

	var onGameProps = function (event) {
		m_$GameProps.show();

		m_$GamePropsWidth.val(m_renderer.getRenderedColumns());
		m_$GamePropsHeight.val(m_renderer.getRenderedRows());

		m_$GamePropsStartingCredits.val(m_gameState.startCredits);
		m_$GamePropsCreditsPerMine.val(m_gameState.creditsPerMine);

		m_$GamePropsLockSizes.prop('checked', self._eworld.blackboard[EditorBlackBoard.Properties.LOCK_SIZES]);
	}

	var onBtnApply = function (event) {
		m_$GameProps.hide();

		m_editorController.setWorldSize(false, parseInt(m_$GamePropsHeight.val()), parseInt(m_$GamePropsWidth.val()));

		m_gameState.startCredits = parseInt(m_$GamePropsStartingCredits.val());
		m_gameState.creditsPerMine = parseInt(m_$GamePropsCreditsPerMine.val());

		self._eworld.blackboard[EditorBlackBoard.Properties.LOCK_SIZES] = m_$GamePropsLockSizes.prop('checked');
	}
	
	var onBtnCancel = function (event) {
		m_$GameProps.hide();
	}
}

ECS.EntityManager.registerSystem('EditorGamePropertiesController', EditorGamePropertiesController);
SystemsUtils.supplySubscriber(EditorGamePropertiesController);