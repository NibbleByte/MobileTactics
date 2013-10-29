//========================================================================================================
// EntityWorld
//
// World that connects (and manages) the entities and systems into one.
// Responsible for notifying the systems for world changes.
//
// Components should contain only data members.
// Any functionality that needs to perform over that data, should be done by the systems. 
// Systems in the world can communicate and notify each other using subscriptions to the world itself.
// Note: EntityWorld is subscribable. Depends on Subscriber.js
//========================================================================================================
"use strict";
var ECS = ECS || {};

ECS.EntityWorld = function () {
	var self = this;
	
	// Events
	Subscriber.makeSubscribable(this);
	
	// Blackboard map (global data for the world).
	this.blackboard = {};
	
	//
	// Entities
	//
	
	// Create managed entity bound to this world.
	// All systems will be notified for this.
	this.createEntity = function () {
		var entity = new ECS.Entity(this);
		
		m_entities.push(entity);
		
		self.trigger(ECS.EntityWorld.Events.ENTITY_ADDED, entity);
		
		return entity;
	};
	
	// Create entity from a "template" (handler that builds up the entity).
	this.createEntityFromTemplate = function (handler) {
		var entity = new ECS.Entity();
		handler(entity);
		
		self.addUnmanagedEntity(entity);
	}
	
	// Add un-managed entity.
	this.addUnmanagedEntity = function (entity) {
		console.assert(entity._entityWorld == null, 'Entity is still managed by another entity world!');
		entity._entityWorld = this;
		
		m_entities.push(entity);
		
		self.trigger(ECS.EntityWorld.Events.ENTITY_ADDED, entity);
	};
	
	this.removeManagedEntity = function (entity) {
		console.assert(entity._entityWorld == this, 'Entity is not managed by this world!');
		
		var foundIndex = m_entities.indexOf(entity);
		
		if (foundIndex > -1) {
			m_entities.splice(foundIndex, 1);
			
			entity._entityWorld = null;
			
			self.trigger(ECS.EntityWorld.Events.ENTITY_REMOVED, entity);
		}
	};
	
	// Get all entities in the world.
	this.getEntities = function () {
		return m_entities;
	};
	
	//
	// Systems
	//
	
	// Adds a system to the world.
	// Only one system per type allowed.
	// System method 'onAdded' will be called, if available.
	// This would be a good place to subscribe for some events etc.
	// All systems will be notified for this.
	this.addSystem = function (system) {
		
		console.assert(ECS.EntityManager.isSystem(system));
		console.assert(m_systems[system._SYS_ID] == undefined);
		
		m_systems[system._SYS_ID] = system;
		
		system._entityWorld = this;
		
		self.trigger(ECS.EntityWorld.Events.SYSTEM_ADDED, system);
		
		var handler = system['onAdded'];
		if (handler)
			handler.apply(system);
	};
	
	// Remove system from the world (by type).
	// System method 'onRemoved' will be called, if available.
	// This would be a good place clean up any subscriptions etc.
	// All systems will be notified for this.
	this.removeSystem = function (systemClass) {
		
		console.assert(ECS.EntityManager.isSystemClass(systemClass));
		
		var system = m_systems[systemClass.prototype._SYS_ID];
		
		if (system != undefined) {
			delete m_systems[systemClass.prototype._SYS_ID];
		
			var handler = system['onRemoved'];
			if (handler)
				handler.apply(system);
			
			delete system._entityWorld;
			
			self.trigger(ECS.EntityWorld.Events.SYSTEM_REMOVED, system);
		}
	};
	
	// Get system in the world (by type)
	this.getSystem = function (systemClass) {
		console.assert(ECS.EntityManager.isSystemClass(systemClass));
		
		return m_systems[systemClass.prototype._SYS_ID];
	};
	
	
	//
	// Private
	//
	
	var m_entities = [];
	var m_systems = new Array(20);	// Expecting no more than 20 systems...
}

// Supported EntityWorld events that systems can subscribe to.
ECS.EntityWorld.Events = {
		SYSTEM_ADDED:	"entityworld.system_added",		// event, system
		SYSTEM_REMOVED:	"entityworld.system_removed",	// event, system
		ENTITY_ADDED:	"entityworld.entity_added",		// event, entity
		ENTITY_REFRESH:	"entityworld.entity_refresh",	// event, entity
		ENTITY_REMOVED:	"entityworld.entity_removed",	// event, entity
}
