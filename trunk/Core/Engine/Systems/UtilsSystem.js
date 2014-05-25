//===============================================
// UtilsSystem
//
// Utilities system.
//===============================================
"use strict";

var UtilsSystem = function () {
	var self = this;
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(ECS.EntityWorld.Events.ENTITY_REMOVED, onEntityRemoved);

		self._eworldSB.subscribe(EngineEvents.Utils.INVALIDATE, onInvalidate);
	}

	var onEntityRemoved = function (event, entity) {
		// Async invalidate, so the others can deal with the object too.
		self._eworld.triggerAsync(EngineEvents.Utils.INVALIDATE, entity);
	}

	// A way to invalidate object using world event. Useful when used with async trigger.
	var onInvalidate = function (event, obj) {
		Utils.invalidate(obj);
	}
}

ECS.EntityManager.registerSystem('UtilsSystem', UtilsSystem);
SystemsUtils.supplySubscriber(UtilsSystem);
