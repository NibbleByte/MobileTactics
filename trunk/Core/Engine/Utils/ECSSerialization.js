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