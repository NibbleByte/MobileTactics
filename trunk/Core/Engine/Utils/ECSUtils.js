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
};

var SystemsUtils = {
	
	_onAddedBasic: function() {
		this._eworld = this.getEntityWorld();
		
		if (this.initialize) {
			this.initialize();
		}
	},
	
	_onRemovedBasic: function() {
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
	
	supplyComponentFilter: function (systemClass, filterComponents) {
		console.assert(ECS.EntityManager.isSystemClass(systemClass));
		console.assert(Utils.isArray(filterComponents));
		
		systemClass.prototype._filterComponents = filterComponents;
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

// Helps for easier access to the blackboard, for per-class-type-values.
ECS.EntityWorld.prototype.extract = function (classType) {
	console.assert(classType, 'Class type must have BLACKBOARD_NAME property to fetch it from the blackboard.');
	
	return this.blackboard[classType.BLACKBOARD_NAME];
};

ECS.EntityWorld.prototype.store = function (classType, value) {
	console.assert(classType, 'Class type must have BLACKBOARD_NAME property to store it to the blackboard.');
	
	this.blackboard[classType.BLACKBOARD_NAME] = value;
};