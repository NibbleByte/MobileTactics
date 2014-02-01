//===============================================
// ECSSerialization
//
// Utilities to help working with ECS.
//===============================================
"use strict";

var ComponentsUtils = {
	registerPersistent: function (name, classType) {
		ECS.EntityManager.registerComponent(name, classType);
		Serialization.registerClass(classType, name);
	},
	
	registerNonPersistent: function (name, classType) {
		ECS.EntityManager.registerComponent(name, classType);
		Serialization.excludeClass(classType);
	}
}

Serialization.registerClass(ECS.Entity, 'ECS.Entity');
Serialization.excludeClass(ECS.EntityWorld);

// Helps for easier access to the blackboard, for per-class-type-values.
ECS.EntityWorld.prototype.extract = function (classType) {
	console.assert(classType, 'Class type must have BLACKBOARD_NAME property to fetch it from the blackboard.');
	
	return this.blackboard[classType.BLACKBOARD_NAME];
};

ECS.EntityWorld.prototype.store = function (classType, value) {
	console.assert(classType, 'Class type must have BLACKBOARD_NAME property to store it to the blackboard.');
	
	this.blackboard[classType.BLACKBOARD_NAME] = value;
};