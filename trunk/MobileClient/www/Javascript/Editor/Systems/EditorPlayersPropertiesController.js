//===============================================
// EditorPlayersPropertiesController
// User control players properties menu.
//===============================================
"use strict";

var EditorPlayersPropertiesController = function () {
	var self = this;
	
	var m_$PlayersProps = $('#PlayersPropsEditor');
	var m_$PlayersPropsTable = $('#PlayersPropsTable');

	var m_subscriber = new DOMSubscriber();

	var m_gameState = null;
	var m_playersData = null;

	var m_shownPlayerIndex = 0;
	var m_$raceSelect = null;
	var m_$typeSelect = null;
	var m_$teamInput = null;
	var m_$startCreditsSelect = null;
	var m_$creditsPerMineSelect = null;

	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADING, onGameLoading);

		m_subscriber.subscribe($('#BtnPlayersProps'), 'click', onPlayersProps);

		m_subscriber.subscribe($('#BtnPlayersPropsNext'), 'click', onBtnNext);
		m_subscriber.subscribe($('#BtnPlayersPropsPrev'), 'click', onBtnPrev);

		m_subscriber.subscribe($('#BtnPlayersPropsClose'), 'click', onBtnClose);
	};
	
	this.uninitialize = function () {
		m_subscriber.unsubscribeAll();
	};

	var onGameLoading = function () {
		m_gameState = self._eworld.extract(GameState);
		m_playersData = self._eworld.extract(PlayersData);
	}

	var onPlayersProps = function (event) {
		m_$PlayersProps.show();

		m_shownPlayerIndex = 0;

		showPlayerProperties(m_playersData.players[m_shownPlayerIndex]);
	}

	var onBtnNext = function (event) {

		applyProps(m_playersData.players[m_shownPlayerIndex]);

		m_shownPlayerIndex = (m_shownPlayerIndex + 1) % m_playersData.players.length;

		showPlayerProperties(m_playersData.players[m_shownPlayerIndex]);
	}
	
	var onBtnPrev = function (event) {
		
		applyProps(m_playersData.players[m_shownPlayerIndex]);

		m_shownPlayerIndex--;

		// JS % operator doesn't work with negative numbers as expected.
		// http://javascript.about.com/od/problemsolving/a/modulobug.htm
		var len = m_playersData.players.length;
		m_shownPlayerIndex = ((m_shownPlayerIndex % len) + len) % len;

		showPlayerProperties(m_playersData.players[m_shownPlayerIndex]);
	}

	var onBtnClose = function (event) {
		m_$PlayersProps.hide();

		applyProps(m_playersData.players[m_shownPlayerIndex]);
	}

	var applyProps = function (player) {
		player.race = parseInt(m_$raceSelect.val());
		player.type = parseInt(m_$typeSelect.val());
		player.teamId = parseInt(m_$teamInput.val());
		player.credits = parseInt(m_$startCreditsSelect.val());
		player.creditsPerMine = parseInt(m_$creditsPerMineSelect.val());

		if (isNaN(player.teamId) || player.teamId < -1)
			player.teamId = -1;
	}

	var showPlayerProperties = function (player) {

		m_$PlayersPropsTable.empty();

		//
		// Title
		//
		var $tr = $('<tr>').appendTo(m_$PlayersPropsTable);
		$('<th>').appendTo($tr).attr('colspan', 2)
			.css('background-color', 'hsla(' + player.colorHue + ', 60%, 40%, 0.8)')
			.text(player.name);


		//
		// Race
		//
		m_$raceSelect = EditorPlayersPropertiesController.populateOptions($('<select>'), Player.Races);
		m_$raceSelect.val(player.race);

		$tr = $('<tr>').appendTo(m_$PlayersPropsTable);
		$('<td>').appendTo($tr).text('Race:');
		$('<td>').appendTo($tr).append(m_$raceSelect);

		//
		// Type
		//
		m_$typeSelect = EditorPlayersPropertiesController.populateOptions($('<select>'), Player.Types);
		m_$typeSelect.val(player.type);

		$tr = $('<tr>').appendTo(m_$PlayersPropsTable);
		$('<td>').appendTo($tr).text('Type:');
		$('<td>').appendTo($tr).append(m_$typeSelect);

		//
		// Team
		//
		m_$teamInput = $('<input>')
		.attr('type', 'number')
		.val(player.teamId);

		$tr = $('<tr>').appendTo(m_$PlayersPropsTable);
		$('<td>').appendTo($tr).text('Team:');
		$('<td>').appendTo($tr).append(m_$teamInput);

		//
		// Starting Credits
		//
		m_$startCreditsSelect = EditorPlayersPropertiesController.populateStartCreditsOptions($('<select>'));
		m_$startCreditsSelect.val(player.credits);

		$tr = $('<tr>').appendTo(m_$PlayersPropsTable);
		$('<td>').appendTo($tr).text('Starting credits:');
		$('<td>').appendTo($tr).append(m_$startCreditsSelect);

		//
		// Credits per mine
		//
		m_$creditsPerMineSelect = EditorPlayersPropertiesController.populateCreditsPerMineOptions($('<select>'));
		m_$creditsPerMineSelect.val(player.creditsPerMine);

		$tr = $('<tr>').appendTo(m_$PlayersPropsTable);
		$('<td>').appendTo($tr).text('Credits per mine:');
		$('<td>').appendTo($tr).append(m_$creditsPerMineSelect);
	}
}

EditorPlayersPropertiesController.populateStartCreditsOptions = function (select) {
	
	return $(select)
	.append('<option value="50">50</option>')
	.append('<option value="100">100</option>')
	.append('<option value="150">150</option>')
	.append('<option value="200">200</option>')
	.append('<option value="250">250</option>')
	.append('<option value="300">300</option>')
	.append('<option value="400">400</option>')
	.append('<option value="500">500</option>')
	.append('<option value="750">750</option>')
	.append('<option value="1000">1000</option>')
	.append('<option value="1500">1500</option>')
	.append('<option value="2000">2000</option>');
}

EditorPlayersPropertiesController.populateCreditsPerMineOptions = function (select) {
	
	return $(select)
	.append('<option value="50">50</option>')
	.append('<option value="100">100</option>')
	.append('<option value="150">150</option>')
	.append('<option value="200">200</option>')
	.append('<option value="250">250</option>')
	.append('<option value="300">300</option>')
	.append('<option value="400">400</option>')
	.append('<option value="500">500</option>');
}

EditorPlayersPropertiesController.populateOptions = function (select, enumClass) {

	for (var name in enumClass) {
		$('<option></option>')
		.attr('value', enumClass[name])
		.text(name)
		.appendTo(select);
	}

	return $(select);
}

ECS.EntityManager.registerSystem('EditorPlayersPropertiesController', EditorPlayersPropertiesController);
SystemsUtils.supplySubscriber(EditorPlayersPropertiesController);