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

	var m_subscriber = new DOMSubscriber();

	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._eworldSB.subscribe(GameplayEvents.Resources.CURRENT_CREDITS_CHANGED, onCreditsChanged);
		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, onTurnChanged);

		self._eworldSB.subscribe(RenderEvents.FightAnimations.FIGHT_STARTED, hideToolbar);
		self._eworldSB.subscribe(RenderEvents.FightAnimations.FIGHT_FINISHED, showToolbar);

		self._eworldSB.subscribe(ClientEvents.Controller.TILE_SELECTED, onTileSelected);

		m_$gameToolbar.show();

		initUnitsInfoList();
	}

	this.uninitialize = function () {
		m_$gameToolbar.hide();

		m_subscriber.unsubscribeAll();
	}

	var onCreditsChanged = function (value, delta) {
		m_$creditsLabel.text(value);
	}


	var onTurnChanged = function (gameState) {
		if (gameState.currentPlayer && gameState.currentPlayer.type == Player.Types.Human) {
			showToolbar();
		} else {
			hideToolbar();
		}
	}

	var hideToolbar = function () {
		m_$gameToolbar.hide();
	}

	var showToolbar = function () {
		m_$gameToolbar.show();
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




		$('<tr>')
		.append('<td>Price:</td>')
		.append('<td>' + definition.price + '</td>')
		.addClass('stat_unit_price')
		.appendTo(m_$unitsInfoStatisticsTable);

		$('<tr>')
		.append('<td>Type:</td>')
		.append('<td>' + pretifyStatType(definition.type) + '</td>')
		.addClass('stat_unit_type')
		.appendTo(m_$unitsInfoStatisticsTable);


		for(var statName in stats) {
			$('<tr>')
			.append('<td>'+ statName + ':</td>')
			.append('<td>' + stats[statName] + '</td>')
			.addClass('stat_unit_' + statName)
			.appendTo(m_$unitsInfoStatisticsTable);
		}
	}

	var onUnitsInfo = function () {
		hideToolbar();

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
		showToolbar();
	}

	var onTileSelected = function (tile) {
		m_lastTileSelected = tile;
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
	m_subscriber.subscribe($('#BtnGameNextTurn'), 'click', onNextTurn);
	m_subscriber.subscribe($('#BtnGameQuit'), 'click', onQuit);

	m_subscriber.subscribe($('#BtnGameUnitsInfoClose'), 'click', onUnitsInfoClose);
	m_subscriber.subscribe(m_$unitsInfoSelect, 'change', onUnitsInfoListChanged);

	m_subscriber.subscribe(StoreScreen, StoreScreen.Events.STORE_SHOWN, hideToolbar);
	m_subscriber.subscribe(StoreScreen, StoreScreen.Events.STORE_HIDE, showToolbar);

}

ECS.EntityManager.registerSystem('GameToolbarSystem', GameToolbarSystem);
SystemsUtils.supplySubscriber(GameToolbarSystem);
