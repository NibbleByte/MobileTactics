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


	var m_$unitsInfoScreen = $('#GameUnitsInfo').hide();
	var m_$unitsInfoSelect = $('#GameUnitsInfoSelect');
	var m_$unitsInfoStatisticsTable = $('#GameUnitsInfoStatistics > tbody');
	var m_lastTileSelected = null;

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

		self._eworldSB.subscribe(GameplayEvents.Resources.CURRENT_CREDITS_CHANGED, onCreditsChanged);

		self._eworldSB.subscribe(RenderEvents.FightAnimations.FIGHT_STARTED, self.hideToolbar);
		self._eworldSB.subscribe(RenderEvents.FightAnimations.FIGHT_FINISHED, self.showToolbar);

		self._eworldSB.subscribe(ClientEvents.Controller.TILE_SELECTED, onTileSelected);

		m_$gameToolbar.show();

		initUnitsInfoList();
	}

	this.uninitialize = function () {
		m_$gameToolbar.hide();

		m_subscriber.unsubscribeAll();
	}

	var onGameLoading = function () {
		m_gameState = self._eworld.extract(GameState);
		m_playersData = self._eworld.extract(PlayersData);
		m_gameMetaData = self._eworld.extract(GameMetaData);
	}

	var onCreditsChanged = function (value, delta) {
		m_$creditsLabel.text(value);
	}

	this.hideToolbar = function () {
		m_$gameToolbar.hide();
	}

	this.showToolbar = function () {
		m_$gameToolbar.show();
	}


	var appendRow = function (name, value, table, rowClass) {
		$('<tr>')
		.append('<td>' + name + ':</td>')
		.append('<td>' + value + '</td>')
		.addClass(rowClass)
		.appendTo(table);
	}


	//
	// Units Info
	//
	var initUnitsInfoList = function () {
		m_$unitsInfoSelect.empty();

		for (var i = 0; i < UnitsDefinitions.length; ++i) {
			
			if (Player.Races.Developers == i) continue;

			$('<option />').prop('disabled', true).text('> ' + Enums.getName(Player.Races, i) + ' <').appendTo(m_$unitsInfoSelect);

			for (var key in UnitsDefinitions[i]) {
				var definition = UnitsDefinitions[i][key];
				var definitionPath = UnitsFactory.generateDefinitionPath(i, definition);

				$('<option />').attr('value', definitionPath).text(definition.name).appendTo(m_$unitsInfoSelect);
			}
		}

		onUnitsInfoListChanged();
	}

	var pretifyStatType = function (type) {
		return '<span class="stat_unit_type_' + type + '">' + Enums.getName(UnitType, type) + '</span>';
	}

	var onUnitsInfoListChanged = function () {
		m_$unitsInfoStatisticsTable.empty();

		var definition = UnitsFactory.resolveDefinitionPath(m_$unitsInfoSelect.val());


		var stats = {};
		
		// Define and sort needed stats.
		stats['AttackLight'] = null;
		stats['AttackHeavy'] = null;
		stats['AttackAerial'] = null;
		stats['AttackRange'] = null;
		stats['Defence'] = null;
		stats['HealRate'] = null;
		stats['Visibility'] = null;
		stats['Movement'] = null;

		for (var statName in stats) {
			stats[statName] = definition.baseStatistics[statName] || '-';
		}



		appendRow('Price', definition.price, m_$unitsInfoStatisticsTable, 'stat_unit_price');
		appendRow('Type', pretifyStatType(definition.type), m_$unitsInfoStatisticsTable, 'stat_unit_type');

		for(var statName in stats) {
			appendRow(statName, stats[statName], m_$unitsInfoStatisticsTable, 'stat_unit_' + statName);
		}
	}

	var onUnitsInfo = function () {
		self.hideToolbar();

		if (m_lastTileSelected && m_lastTileSelected.CTile.placedObjects.length > 0) {
			var placeable = m_lastTileSelected.CTile.placedObjects[0];
			var definitionPath = UnitsFactory.generateDefinitionPath(placeable.CUnit.getDefinition());

			m_$unitsInfoSelect.find('option[selected]').prop('selected', false);
			m_$unitsInfoSelect.find('option[value="' + definitionPath + '"]').prop('selected', true);
		}

		m_$unitsInfoScreen.show();
	}

	var onUnitsInfoClose = function () {

		m_$unitsInfoScreen.hide();
		self.showToolbar();
	}

	var onTileSelected = function (tile) {
		m_lastTileSelected = tile;
	}


	//
	// Game State Info
	//
	var onGameStateInfo = function () {
		self.hideToolbar();

		//
		// Stats
		//
		var player = m_gameState.currentPlayer;
		if (!player)
			player = m_playersData.players[0];

		var minesCount = m_gameState.currentStructuresTypes[GameWorldTerrainType.Minerals].length;

		m_$gameStateInfoStatisticsTable.empty();

		appendRow('Map', m_gameMetaData.name, m_$gameStateInfoStatisticsTable);
		appendRow('Custom', m_gameState.isCustomMap, m_$gameStateInfoStatisticsTable);
		appendRow('Turns', m_gameState.turnsPassed, m_$gameStateInfoStatisticsTable);
		appendRow('Mines', minesCount, m_$gameStateInfoStatisticsTable);
		appendRow('Credits/Mine', player.creditsPerMine, m_$gameStateInfoStatisticsTable);
		appendRow('Credits/Turn', minesCount * player.creditsPerMine, m_$gameStateInfoStatisticsTable);


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
			.append('<td>Player ' + (i + 1) + '</td>')
			.append('<td>' + Enums.getName(Player.Races, player.race) + '</td>')
			.append('<td>' + team + '</td>')
			.append(type)
			.appendTo(m_$gameStateInfoPlayersTable);
		}

		m_$gameStateInfoScreen.show();
	}

	var onGameStateInfoClose = function () {
		m_$gameStateInfoScreen.hide();
		self.showToolbar();
	}


	//
	// Others
	//
	var onNextTurn = function () {
		self._eworld.trigger(GameplayEvents.GameState.END_TURN);
	}

	var onQuit = function () {
		ClientStateManager.changeState(ClientStateManager.types.MenuScreen);
	}



	m_subscriber.subscribe($('#BtnGameUnitInfo'), 'click', onUnitsInfo);
	m_subscriber.subscribe($('#BtnGameStateInfo'), 'click', onGameStateInfo);
	m_subscriber.subscribe($('#BtnGameNextTurn'), 'click', onNextTurn);
	m_subscriber.subscribe($('#BtnGameQuit'), 'click', onQuit);

	m_subscriber.subscribe($('#BtnGameUnitsInfoClose'), 'click', onUnitsInfoClose);
	m_subscriber.subscribe(m_$unitsInfoSelect, 'change', onUnitsInfoListChanged);

	m_subscriber.subscribe($('#BtnGameStateInfoClose'), 'click', onGameStateInfoClose);

	m_subscriber.subscribe(StoreScreen, StoreScreen.Events.STORE_SHOWN, self.hideToolbar);
	m_subscriber.subscribe(StoreScreen, StoreScreen.Events.STORE_HIDE, self.showToolbar);

}

ECS.EntityManager.registerSystem('GameToolbarSystem', GameToolbarSystem);
SystemsUtils.supplySubscriber(GameToolbarSystem);
