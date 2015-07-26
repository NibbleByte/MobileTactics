//========================================================================================================
// EntityComponentFilter
//
// Tool used by the systems, to filter out only entities that has specified components.
//========================================================================================================
"use strict";
var ECS = ECS || {};

// Keeps filtered collection based on the desired component types.
// componentFilterClasses should be an array of component classes.
ECS.EntityComponentFilter = function (world, componentFilterClassesOrPredicate) {
	var self = this;

	console.assert(Utils.isArray(componentFilterClassesOrPredicate) || Utils.isFunction(componentFilterClassesOrPredicate));
	
	// Filtered entities.
	this.entities = [];

	// Notifications (will be called on adding/removing entity from the filtered collection)
	this.onEntityAddedHandler = null;
	this.onEntityRemovedHandler = null;

	this.addRefreshEvent = function (eventName) {
		m_worldSB.subscribe(eventName, 	onEntityRefresh);
	}
	
	// Should call this when not needed anymore.
	this.destroy = function () {
		m_worldSB.unsubscribeAll();
	}
	
	// Check if this entity has the needed components (or predicate says true).
	var isInterested = function (entity) {
		if (Utils.isFunction(componentFilterClassesOrPredicate))
			return componentFilterClassesOrPredicate(entity);

		var hasComponents = true;
		for(var j = 0; j < componentFilterClassesOrPredicate.length; ++j) {
			if (!entity[componentFilterClassesOrPredicate[j].prototype._COMP_NAME]) {
				hasComponents = false;
				break;
			}
				
		}
		
		return hasComponents;
	};
	
	
	//
	// Entities
	//
	var onEntityAdded = function (entity) {
		// NOTE: Recursively it is possible first to be called refresh, before add event.
		// This is why we need to check if not already in the collection.
		if (isInterested(entity) && self.entities.indexOf(entity) == -1) {
			self.entities.push(entity);

			if (self.onEntityAddedHandler)
				self.onEntityAddedHandler(entity);
		}
	}
	
	
	var onEntityRefresh = function (entity) {
		
		var foundIndex = self.entities.indexOf(entity);
		var interested = isInterested(entity);
		
		if (interested && foundIndex == -1) {
			self.entities.push(entity);

			if (self.onEntityAddedHandler)
				self.onEntityAddedHandler(entity);

		} else if (!interested && foundIndex != -1) {
			self.entities.splice(foundIndex, 1);

			if (self.onEntityRemovedHandler)
				self.onEntityRemovedHandler(entity);
		}
	}
	
	
	var onEntityRemoved = function (entity) {
		var foundIndex = self.entities.indexOf(entity);
		if (foundIndex > -1) {
			self.entities.splice(foundIndex, 1);

			if (self.onEntityRemovedHandler)
				self.onEntityRemovedHandler(entity);
		}
	}
	
	//
	// Initialize
	//
	var m_worldSB = world.createSubscriber();
	m_worldSB.subscribe(ECS.EntityWorld.Events.ENTITY_ADDED, 	onEntityAdded);
	m_worldSB.subscribe(ECS.EntityWorld.Events.ENTITY_REFRESH, 	onEntityRefresh);
	m_worldSB.subscribe(ECS.EntityWorld.Events.ENTITY_REMOVED, 	onEntityRemoved);
	
	var allEntities = world.getEntities();
	for(var i = 0; i < allEntities.length; ++i) {
		if (isInterested(allEntities[i])) {
			self.entities.push(allEntities[i]);
		}
	}
	
	
}; 
