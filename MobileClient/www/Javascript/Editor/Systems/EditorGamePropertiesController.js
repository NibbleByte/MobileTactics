//===============================================
// EditorGamePropertiesController
// User control game properties menu.
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
	var m_$GamePropsPlayers = $('#GamePropsPlayersEditor');

	var m_$GamePropsCustomMap = $('#GamePropsCustomMapEditor');
	var m_$CustomMapMenus = m_$GameProps.find('[custom_map]');
	var m_$GenericMapMenus = m_$GameProps.find('[generic_map]');

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

		m_subscriber.subscribe(m_$GamePropsCustomMap, 'change', onCustomMapChanged);

		// Hide/Show during PlayersProps menu
		m_subscriber.subscribe($('#BtnPlayersProps'), 'click', onPlayersProps);
		m_subscriber.subscribe($('#BtnPlayersPropsClose'), 'click', onPlayersPropsHide);

		self._eworld.blackboard[EditorBlackBoard.Properties.LOCK_SIZES] = false;

		EditorPlayersPropertiesController.populateStartCreditsOptions(m_$GamePropsStartingCredits.empty());
		EditorPlayersPropertiesController.populateCreditsPerMineOptions(m_$GamePropsCreditsPerMine.empty());
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

		m_$GamePropsStartingCredits.val(m_playersData.players[0].credits);
		m_$GamePropsCreditsPerMine.val(m_playersData.players[0].creditsPerMine);

		m_$GamePropsPlayers.val(m_playersData.players.length);

		m_$GamePropsLockSizes.prop('checked', self._eworld.blackboard[EditorBlackBoard.Properties.LOCK_SIZES]);
		m_$GamePropsCustomMap.prop('checked', m_gameState.isCustomMap);

		showCustomMapMenus(m_$GamePropsCustomMap.prop('checked'));
	}

	var onBtnApply = function (event) {
		m_$GameProps.hide();

		m_editorController.setWorldSize(false, parseInt(m_$GamePropsHeight.val()), parseInt(m_$GamePropsWidth.val()));

		m_gameState.isCustomMap = m_$GamePropsCustomMap.prop('checked');


		if (!m_gameState.isCustomMap) {
			for(var i = 0; i < m_playersData.players.length; ++i) {
				var player = m_playersData.players[i];

				player.creditsPerMine = parseInt(m_$GamePropsCreditsPerMine.val());
				player.credits = parseInt(m_$GamePropsStartingCredits.val());
			}
		}

		var playersCount = parseInt(m_$GamePropsPlayers.val());
		while(m_playersData.players.length > playersCount) {
			m_playersData.removePlayer(m_playersData.players.last());
		}

		while(m_playersData.players.length < playersCount) {
			var name = 'Pl' + (m_playersData.players.length + 1);
			var color = PlayerColors[m_playersData.players.length];
			
			m_playersData.addPlayer(name, Player.Types.Human, Player.Races.Empire, color);
		}

		self._eworld.blackboard[EditorBlackBoard.Properties.LOCK_SIZES] = m_$GamePropsLockSizes.prop('checked');
	}
	
	var onBtnCancel = function (event) {
		m_$GameProps.hide();
	}

	var onPlayersProps = function (event) {
		m_$GameProps.hide();
	}

	var onPlayersPropsHide = function (event) {

		// To make sure if changes to players were made, canceling here works correctly.
		m_gameState.isCustomMap = true;

		m_$GameProps.show();
	}

	var onCustomMapChanged = function () {
		showCustomMapMenus(m_$GamePropsCustomMap.prop('checked'));
	}

	var showCustomMapMenus = function (isCustom) {
		if (isCustom) {
			m_$CustomMapMenus.show();
			m_$GenericMapMenus.hide();
		} else {
			m_$CustomMapMenus.hide();
			m_$GenericMapMenus.show();	
		}
	}
}

ECS.EntityManager.registerSystem('EditorGamePropertiesController', EditorGamePropertiesController);
SystemsUtils.supplySubscriber(EditorGamePropertiesController);