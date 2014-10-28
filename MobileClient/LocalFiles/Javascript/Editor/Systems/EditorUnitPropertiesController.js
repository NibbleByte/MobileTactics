//===============================================
// EditorController
// User control in the editor.
//===============================================
"use strict";

var EditorUnitPropertiesController = function (m_world) {
	var self = this;
	
	var m_$UnitProps = $('#UnitPropsEditor');
	var m_$UnitPropsName = $('#UnitPropsNameEditor');

	var m_$UnitPropsHealth = $('#UnitPropsHealthEditor');
	var m_$UnitPropsHealthLabel = $('#UnitPropsHealthLabelEditor');

	var m_subscriber = new DOMSubscriber();

	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._eworldSB.subscribe(ClientEvents.Input.TILE_CLICKED, onTileClicked);

		m_subscriber.subscribe($('#BtnUnitPropsApply'), 'click', onBtnApply);
		m_subscriber.subscribe($('#BtnUnitPropsCancel'), 'click', onBtnCancel);

		m_subscriber.subscribe(m_$UnitPropsHealth, 'input', onHealthChange);
		m_subscriber.subscribe(m_$UnitPropsHealth, 'change', onHealthChange);
	};
	
	this.uninitialize = function () {
		m_subscriber.unsubscribeAll();
	};

	
	var onTileClicked = function (event, hitData) {
		
		var brush = self._eworld.blackboard[EditorBlackBoard.Brushes.CURRENT_BRUSH];

		if (!brush && hitData.tile && hitData.tile.CTile.placedObjects.length > 0) {
			populateProperties(hitData.tile.CTile.placedObjects[0]);
			m_$UnitProps.show();
		}
	}

	var onHealthChange = function (event) {
		m_$UnitPropsHealthLabel.text(m_$UnitPropsHealth.val());
	}

	var unit;
	var populateProperties = function (showUnit) {
		unit = showUnit;
		m_$UnitPropsName.text(unit.CUnit.name);
		m_$UnitPropsHealth.val(unit.CUnit.health);

		onHealthChange(null);
	}

	var onBtnApply = function (event) {
		m_$UnitProps.hide();

		unit.CUnit.health = MathUtils.clamp(parseInt(m_$UnitPropsHealth.val()), 1, unit.CStatistics.statistics['MaxHealth']);
		self._eworld.trigger(GameplayEvents.Units.UNIT_CHANGED, unit);

		unit = null;
	}
	
	var onBtnCancel = function (event) {
		m_$UnitProps.hide();
	}
}

ECS.EntityManager.registerSystem('EditorUnitPropertiesController', EditorUnitPropertiesController);
SystemsUtils.supplySubscriber(EditorUnitPropertiesController);