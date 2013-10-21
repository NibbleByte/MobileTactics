//===============================================
// UnitFactory.js
// Factory for creating units.
//===============================================
"use strict";

//DEBUG: global Access
var lastCreated;

var UnitsFactory = new function () {
	var self = this;
	
	this.Events = {
		UNIT_CREATED: 		"unitsfactory.unit_created",		// event, unit
		UNIT_DESERIALIZED: 	"unitsfactory.unit_deserialized",	// event, unit
	};
	
	this.createUnit = function (unitName) {
		
		var definition = UnitsDefinitions[unitName];
		console.assert(definition, unitName + ' is not a valid unit name!');
		
		var obj = new ECS.Entity();
		obj.addComponent(CTilePlaceable);
		obj.addComponent(CUnit);
		obj.addComponent(CActions);
		
		obj.addComponent(CStatistics);
		obj.addComponent(CEffects);
		
		obj.CUnit.name = unitName;
		obj.CStatistics.resetStatistics(definition.baseStatistics);
		obj.CActions.actions = definition.actions;
		
		lastCreated = obj;
		
		self.trigger(self.Events.UNIT_CREATED, obj);
		
		return obj;
	};
	
	// Checks if this is unit and applies post deserialization stuff
	this.postDeserialize = function (entity) {
		if (!entity.hasComponents(CUnit))
			return;
		
		self.trigger(self.Events.UNIT_DESERIALIZED, entity);
	}
	
	Subscriber.makeSubscribable(this);
};
