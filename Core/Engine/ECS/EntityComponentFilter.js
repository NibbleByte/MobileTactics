//========================================================================================================
// EntityComponentFilter
//
// Tool used by the systems, to filter out only entities that has specified components.
//========================================================================================================
"use strict";
var ECS = ECS || {};

// Keeps filtered collection based on the desired component types.
// componentFilterClasses should be an array of component classes.
ECS.EntityComponentFilter = function (world, componentFilterClasses) {
	var self = this;
	
	// Filtered entities.
	this.entities = [];
	
	// Should call this when not needed anymore.
	this.destroy = function () {
		m_worldSB.unsubscribeAll();
	}
	
	// Check if this entity has the needed components.
	var isInterested = function (entity) {
		var hasComponents = true;
		for(var j = 0; j < componentFilterClasses.length; ++j) {
			if (!entity[componentFilterClasses[j].prototype._COMP_NAME]) {
				hasComponents = false;
				break;
			}
				
		}
		
		return hasComponents;
	};
	
	
	//
	// Entities
	//
	var onEntityAdded = function (event, entity) {
		if (isInterested(entity))
			self.entities.push(entity);
	}
	
	
	var onEntityRefresh = function (event, entity) {
		
		var foundIndex = self.entities.indexOf(entity);
		var interested = isInterested(entity);
		
		if (interested && foundIndex == -1) {
			self.entities.push(entity);
		} else if (!interested && foundIndex != -1) {
			self.entities.splice(foundIndex, 1);
		}
	}
	
	
	var onEntityRemoved = function (event, entity) {
		var foundIndex = self.entities.indexOf(entity);
		if (foundIndex > -1) {
			self.entities.splice(foundIndex, 1);
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
