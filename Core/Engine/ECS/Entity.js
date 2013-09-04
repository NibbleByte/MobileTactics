//========================================================================================================
// Entity
//
// Single entity in the world.
// Every entity can has different components.
// Every component should contain only data members.
// On adding/removing components, the world and the systems get notified.
//========================================================================================================
"use strict";
var ECS = ECS || {};

// Entities created with no world are un-managed.
// Add entities to the world in order to be processed.
ECS.Entity = function (world) {
	
	world = world || null;
	
	this._entityWorld = world;
}


// Add single component to this entity (by type). 
// All systems will be notified for this.
// Note: only one component per type allowed.
ECS.Entity.prototype.addComponent = function (componentClass) {
	
	var componentName = componentClass.prototype._COMP_NAME;
	
	console.assert(componentName && this[componentName] == undefined );
	
	this[componentName] = new componentClass;
	
	if (this._entityWorld)
		this._entityWorld.trigger(ECS.EntityWorld.Events.ENTITY_REFRESH, entity);
}

// Remove single component from this entity (by type).
// All systems will be notified for this.
ECS.Entity.prototype.removeComponent = function (componentClass) {
	
	var componentName = componentClass.prototype._COMP_NAME;
	
	console.assert(componentName && this[componentName]);
	
	delete this[componentName];
	
	if (this._entityWorld)
		this._entityWorld.trigger(ECS.EntityWorld.Events.ENTITY_REFRESH, entity);
}

// Get the world this entity is managed by.
ECS.Entity.prototype.getEntityWorld = function () {
	return this._entityWorld;
}

// Removes the entity from the world.
// All systems will be notified for this.
ECS.Entity.prototype.destroy = function () {
	if (this._entityWorld) {
		this._entityWorld.removeManagedEntity(this);
	}
}

// Checks if the entity has the specified components.
// Overloads:
//		bool hasComponents(comp1, comp2, comp3, ... );
//		bool hasComponents([comp1, comp2, comp3, ...]);
ECS.Entity.prototype.hasComponents = function (components) {
	
	var compCollection = arguments;
	if (components instanceof Array)
		compCollection = components;
	
	for(var i = 0; i < compCollection.length; ++i) {
		if (!this[compCollection[i].prototype.getComponentName()])
			return false;
	}
	
	return true;
}