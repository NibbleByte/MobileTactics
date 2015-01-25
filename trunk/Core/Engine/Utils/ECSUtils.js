//===============================================
// ECSSerialization
//
// Utilities to help working with ECS.
//===============================================
"use strict";

var ComponentsUtils = {
	registerPersistent: function (classType) {
		ECS.EntityManager.registerComponent(classType.name, classType);
		Serialization.registerClass(classType, classType.name);
	},
	
	registerNonPersistent: function (classType) {
		ECS.EntityManager.registerComponent(classType.name, classType);
		Serialization.excludeClass(classType);
	}
};

var SystemsUtils = {
	
	_onAddedBasics: function() {
		this._eworld = this.getEntityWorld();
		
		if (this.initialize) {
			this.initialize();
		}
	},
	
	_onRemovedBasics: function() {
		if (this.uninitialize) {
			this.uninitialize();
		}
		
		this._eworld = null;
	},
	
	
	_onAddedSubscriber: function() {
		this._eworld = this.getEntityWorld();
		this._eworldSB = this._eworld.createSubscriber();
		
		if (this.initialize) {
			this.initialize();
		}
	},
	
	_onRemovedSubscriber: function() {
		if (this.uninitialize) {
			this.uninitialize();
		}
		
		this._eworldSB.unsubscribeAll();
		this._eworldSB = null;
		this._eworld = null;
	},
	
	
	_onAddedComponentFilter: function() {
		this._eworld = this.getEntityWorld();
		this._eworldSB = this._eworld.createSubscriber();
		this._entityFilter = new ECS.EntityComponentFilter(this._eworld, this._filterComponents);
		
		if (this.initialize) {
			this.initialize();
		}
	},
	
	_onRemovedComponentFilter: function() {
		if (this.uninitialize) {
			this.uninitialize();
		}
		
		this._entityFilter.destroy();
		this._entityFilter = null;
		this._eworldSB.unsubscribeAll();
		this._eworldSB = null;
		this._eworld = null;
	},
	
	
	_onAddedComponentFilterOnly: function() {
		this._eworld = this.getEntityWorld();
		this._entityFilter = new ECS.EntityComponentFilter(this._eworld, this._filterComponents);
		
		if (this.initialize) {
			this.initialize();
		}
	},
	
	_onRemovedComponentFilterOnly: function() {
		if (this.uninitialize) {
			this.uninitialize();
		}
		
		this._entityFilter.destroy();
		this._entityFilter = null;
		this._eworld = null;
	},
	
	
	
	
	supplyBasics: function (systemClass) {
		console.assert(ECS.EntityManager.isSystemClass(systemClass));
		
		systemClass.prototype.onAdded = this._onAddedBasics;
		systemClass.prototype.onRemoved = this._onRemovedBasics;
	},
	
	supplySubscriber: function (systemClass) {
		console.assert(ECS.EntityManager.isSystemClass(systemClass));
		
		systemClass.prototype.onAdded = this._onAddedSubscriber;
		systemClass.prototype.onRemoved = this._onRemovedSubscriber;
	},
	
	supplyComponentFilter: function (systemClass, filterComponentsOrPredicate) {
		console.assert(ECS.EntityManager.isSystemClass(systemClass));
		
		systemClass.prototype._filterComponents = filterComponentsOrPredicate;
		systemClass.prototype.onAdded = this._onAddedComponentFilter;
		systemClass.prototype.onRemoved = this._onRemovedComponentFilter;
	},
	
	supplyComponentFilterOnly: function (systemClass, filterComponents) {
		console.assert(ECS.EntityManager.isSystemClass(systemClass));
		console.assert(Utils.isArray(filterComponents));
		
		systemClass.prototype._filterComponents = filterComponents;
		systemClass.prototype.onAdded = this._onAddedComponentFilterOnly;
		systemClass.prototype.onRemoved = this._onRemovedComponentFilterOnly;
	},
};

Serialization.registerClass(ECS.Entity, 'ECS.Entity');
Serialization.excludeClass(ECS.EntityWorld);

ECS.EntityWorld.__blackboardTypesRegistered = 0;

// Helps for easier access to the blackboard, for per-class-type-values.
ECS.EntityWorld.prototype.extract = function (classType) {
	
	// If it doesn't have name, generate one.
	if (!classType.BLACKBOARD_NAME) {
		classType.BLACKBOARD_NAME = 'BLACKBOARD_TYPE_' + ECS.EntityWorld.__blackboardTypesRegistered;
		ECS.EntityWorld.__blackboardTypesRegistered++;
	}
	
	return this.blackboard[classType.BLACKBOARD_NAME];
};

ECS.EntityWorld.prototype.store = function (classType, value) {

	// If it doesn't have name, generate one.
	if (!classType.BLACKBOARD_NAME) {
		classType.BLACKBOARD_NAME = 'BLACKBOARD_TYPE_' + ECS.EntityWorld.__blackboardTypesRegistered;
		ECS.EntityWorld.__blackboardTypesRegistered++;
	}
	
	this.blackboard[classType.BLACKBOARD_NAME] = value;

	return value;
};