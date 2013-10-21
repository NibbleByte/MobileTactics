//===============================================
// UnitFactoryClient.js
// Adding client functionality to client.
//===============================================
"use strict";

var UnitsFactoryClient = new function () {
	
	var applyClient = function (event, unit) {
		if (unit.CUnit.name == 'TeslaTrooper') {
			unit.addComponent(CAnimations);
		}
	}
	
	var m_factorySB = UnitsFactory.createSubscriber();
	m_factorySB.subscribe(UnitsFactory.Events.UNIT_CREATED, applyClient);
	m_factorySB.subscribe(UnitsFactory.Events.UNIT_DESERIALIZED, applyClient);
};
