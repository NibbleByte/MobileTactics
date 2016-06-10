//===============================================
// UIUnitsInfo
// 
//===============================================
"use strict";

var UIUnitsInfo = function () {
	var self = this;
	
	var m_$unitsInfoScreen = $('#GameUnitsInfo').hide();
	var m_$unitsInfoSelect = $('#GameUnitsInfoSelect');
	var m_$unitsInfoStatisticsTable = $('#GameUnitsInfoStatistics > tbody');
	var m_lastTileSelected = null;

	var m_subscriber = new DOMSubscriber();

	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._eworldSB.subscribe(ClientEvents.Controller.TILE_SELECTED, onTileSelected);
		self._eworldSB.subscribe(ClientEvents.UI.STATE_CHANGED, onStateChanged);

		initUnitsInfoList();
	}

	this.uninitialize = function () {
		m_subscriber.unsubscribeAll();
	}


	//
	// Units Info
	//
	var initUnitsInfoList = function () {
		m_$unitsInfoSelect.empty();
		
		var selectedOption = null;

		for (var i = 0; i < UnitsDefinitions.length; ++i) {
			
			if (Player.Races.Developers == i) continue;

			$('<option />').prop('disabled', true).text('> ' + Enums.getName(Player.Races, i) + ' <').appendTo(m_$unitsInfoSelect);

			for (var key in UnitsDefinitions[i]) {
				var definition = UnitsDefinitions[i][key];
				var definitionPath = UnitsFactory.generateDefinitionPath(i, definition);

				var option = $('<option />').attr('value', definitionPath).text(definition.name).appendTo(m_$unitsInfoSelect);
				if (!selectedOption) selectedOption = option;
			}
		}
		
		selectedOption.prop('selected', true);
		
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



		RenderUtils.appendRow('Price', definition.price, m_$unitsInfoStatisticsTable, 'stat_unit_price');
		RenderUtils.appendRow('Type', pretifyStatType(definition.type), m_$unitsInfoStatisticsTable, 'stat_unit_type');

		for(var statName in stats) {
			RenderUtils.appendRow(statName, stats[statName], m_$unitsInfoStatisticsTable, 'stat_unit_' + statName);
		}
	}

	var show = function () {
		
		if (m_lastTileSelected && m_lastTileSelected.CTile.placedObjects.length > 0) {
			var placeable = m_lastTileSelected.CTile.placedObjects[0];
			var definitionPath = UnitsFactory.generateDefinitionPath(placeable.CUnit.getDefinition());

			m_$unitsInfoSelect.find('option[selected]').prop('selected', false);
			m_$unitsInfoSelect.find('option[value="' + definitionPath + '"]').prop('selected', true);
		}

		m_$unitsInfoScreen.show();
	}

	var hide = function () {
		m_$unitsInfoScreen.hide();
	}

	var onStateChanged = function (state) {

		if (state != GameUISystem.States.UnitInfo) {
			hide();
		} else {
			show();
		}
	}

	var onUnitsInfoClose = function () {
		self._eworld.trigger(ClientEvents.UI.POP_STATE);
	}

	var onTileSelected = function (tile) {
		m_lastTileSelected = tile;
	}


	m_subscriber.subscribe($('#BtnGameUnitsInfoClose'), 'click', onUnitsInfoClose);
	m_subscriber.subscribe(m_$unitsInfoSelect, 'change', onUnitsInfoListChanged);
}

ECS.EntityManager.registerSystem('UIUnitsInfo', UIUnitsInfo);
SystemsUtils.supplySubscriber(UIUnitsInfo);
