//===============================================
// UnitFactoryClient.js
// Adding client functionality to client.
//===============================================
"use strict";

var UnitsFactoryClient = new function () {
	
	var applyClient = function (event, unit) {
		// Fill custom client logic.
	}
	
	var m_factorySB = UnitsFactory.createSubscriber();
	m_factorySB.subscribe(UnitsFactory.Events.UNIT_CREATED, applyClient);
	m_factorySB.subscribe(UnitsFactory.Events.UNIT_DESERIALIZED, applyClient);
};
