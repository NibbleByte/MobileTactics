//========================================================================================================
// Entity
//
// Single entity in the world.
// Every entity can have different components.
// Every component should contain only data members.
// On adding/removing components, the world and the systems get notified.
// NOTE: After destroying entity, the flag "destroyed" is set. Don't use this entity afterwards.
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
// Returns newly added component.
// All systems will be notified for this.
// Supply initializer handler, to do some component initialization BEFORE the world is notified of this.
// Note: only one component per type allowed.
ECS.Entity.prototype.addComponent = function (componentClass, initializer) {

	console.assert(!this.destroyed, 'Trying to use a destroyed entity.');
	
	var componentName = componentClass.prototype._COMP_NAME;
	
	console.assert(componentName && this[componentName] == undefined );
	
	var component = new componentClass;
	this[componentName] = component;

	if (initializer) {
		initializer(component, this);
	}
	
	if (this._entityWorld)
		this._entityWorld.trigger(ECS.EntityWorld.Events.ENTITY_REFRESH, this);
	
	return component;
}

// First checks if the component is already available and returns it. If not adds it.
// Else creates it and returns the new component.
// All systems will be notified for this.
// Supply initializer handler, to do some component initialization BEFORE the world is notified of this.
ECS.Entity.prototype.addComponentSafe = function (componentClass, initializer) {

	var componentName = componentClass.prototype._COMP_NAME;

	var component = this[componentName];

	if (component == undefined) {
		component = this.addComponent(componentClass, initializer);

	} else if (initializer) {
		initializer(component, this);
	}
		
	
	return component;
}

// Remove single component from this entity (by type).
// Will call special destroy() method of the component if available.
// All systems will be notified for this.
ECS.Entity.prototype.removeComponent = function (componentClass) {
	
	console.assert(!this.destroyed, 'Trying to use a destroyed entity.');

	var componentName = componentClass.prototype._COMP_NAME;
	var component = this[componentName];
	
	console.assert(component);

	// Cache this to graveyard
	if (this._entityWorld) {
		var graveyard = this._entityWorld.graveyard;
		var dummy = {};
		dummy[componentName] = component;
		graveyard.removedComponents.push(dummy);
		graveyard.removedComponentsFrom.push(this);
	}

	// Remove component before event in order to detect properly that components are missing.
	delete this[componentName];
	
	if (this._entityWorld) {
		this._entityWorld.trigger(ECS.EntityWorld.Events.ENTITY_REFRESH, this);

		// Pop the entity/components from the graveyard, not needed anymore.
		console.assert(graveyard.removedComponents.pop() == dummy)
		console.assert(graveyard.removedComponentsFrom.pop() == this);
	}
	
	// Call destructor after destroyed.
	// NOTE: This might be a problem with merged components... unless merging their destructros as well.
	if (component.destroy) {
		component.destroy();
	}
}

// First checks if the component is available, then remove it if so.
// Will call special destroy() method of the component if available.
// All systems will be notified for this.
ECS.Entity.prototype.removeComponentSafe = function (componentClass) {
	
	var componentName = componentClass.prototype._COMP_NAME;

	if (this[componentName]) {
		this.removeComponent(componentClass);
	}
}

// Get the world this entity is managed by.
ECS.Entity.prototype.getEntityWorld = function () {
	return this._entityWorld;
}

// Check if entity is attached at all.
ECS.Entity.prototype.isAttached = function () {
	return this._entityWorld != null;
}

// Removes the entity from the world.
// Will call special destroy() method of the components if available.
// All systems will be notified for this.
// Sets the flag "destroyed".
ECS.Entity.prototype.destroy = function () {

	var entityWorld = this._entityWorld;
	
	if (entityWorld) {
		var graveyard = entityWorld.graveyard;
		var dummy = {};

		// Cache all components to graveyard
		for(var field in this) {
			if (!this[field])
				continue;

			if (ECS.EntityManager.isComponent(this[field])) {
				dummy[field] = this[field];
			}
		}

		graveyard.removedComponents.push(dummy);
		graveyard.removedComponentsFrom.push(this);
		graveyard.destroyedEntity.push(this);

		entityWorld.removeManagedEntity(this);
		entityWorld.trigger(ECS.EntityWorld.Events.ENTITY_DESTROYED, this);

		// Pop the entity/components from the graveyard, not needed anymore.
		console.assert(graveyard.removedComponents.pop() == dummy)
		console.assert(graveyard.removedComponentsFrom.pop() == this);
		console.assert(graveyard.destroyedEntity.pop() == this);
	}

	// Call destructor after destroyed (so in ENTITY_REMOVED event can have last access to components).
	// NOTE: This might be a problem with merged components... unless merging their destructros as well.
	for(var field in this) {
		if (!this[field])
			continue;

		if (this[field].destroy)
			this[field].destroy();

		delete this[field];
	}

	this.destroyed = true;

	if (entityWorld) {
		entityWorld.trigger(ECS.EntityWorld.Events.ENTITY_DESTROY_FINALIZED, this);
	}
}

// Checks if the entity has the specified components.
// Overloads:
//		bool hasComponents(comp1, comp2, comp3, ... );
//		bool hasComponents([comp1, comp2, comp3, ...]);
ECS.Entity.prototype.hasComponents = function (components) {
	
	console.assert(!this.destroyed, 'Trying to use a destroyed entity.');

	var compCollection = arguments;
	if (components instanceof Array)
		compCollection = components;
	
	for(var i = 0; i < compCollection.length; ++i) {
		if (!this[compCollection[i].prototype.getComponentName()])
			return false;
	}
	
	return true;
}