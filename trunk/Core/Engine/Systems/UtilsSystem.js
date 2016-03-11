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

		if (!ClientUtils.isMockUp)
			return;

		self._eworldSB.subscribe(ECS.EntityWorld.Events.ENTITY_DESTROY_FINALIZED, onEntityDestroyed);

		self._eworldSB.subscribe(EngineEvents.Utils.INVALIDATE, onInvalidate);
	}

	var onEntityDestroyed = function (entity) {
		// Async invalidate, so the others can deal with the object too.
		self._eworld.triggerAsync(EngineEvents.Utils.INVALIDATE, entity);
	}

	// A way to invalidate object using world event. Useful when used with async trigger.
	var onInvalidate = function (obj) {
		var destroyed = obj.destroyed;
		Utils.invalidate(obj);

		// Keep the destroyed flag for last moment usage.
		obj.destroyed = destroyed;
	}
}

ECS.EntityManager.registerSystem('UtilsSystem', UtilsSystem);
SystemsUtils.supplySubscriber(UtilsSystem);
