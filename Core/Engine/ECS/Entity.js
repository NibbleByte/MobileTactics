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

// Entities should be created only by EntityWorld instance.
ECS.Entity = function (world) {
	console.assert(world, 'Must be created from EntityWorld.createEntity() call!');
	
	this._entityWorld = world;
}

// Add single component to this entity (by type). 
// Note: only one component per type allowed.
ECS.Entity.prototype.addComponent = function (componentClass) {
	this._entityWorld.addComponent(this, componentClass);
}

// Remove single component from this entity (by type).
ECS.Entity.prototype.removeComponent = function (componentClass) {
	this._entityWorld.removeComponent(this, componentClass);	
}

// Get the world this entity is managed by.
ECS.Entity.prototype.getEntityWorld = function () {
	return this._entityWorld;
}

// Removes the entity from the world.
ECS.Entity.prototype.destroy = function () {
	this._entityWorld.destroyEntity(this);
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