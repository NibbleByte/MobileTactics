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

	// Entities/components graveyard, where currently removed entities/components can be found.
	// Supports recursive removing (the reason it uses arrays).
	this.graveyard = {
		removedComponents: [],	// Useful for un-initializing removed components on ENTITY_REFRESH event, as it doesn't provide component difference.
		removedComponentsFrom: [],	// To whom does those components belong to.
		removedEntity: [],		// Currently removed (unmanaged)/destroyed entity.
		destroyedEntity: [],	// Currently destroyed entity.
	}
	
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

			self.graveyard.removedEntity.push(entity);
			
			self.trigger(ECS.EntityWorld.Events.ENTITY_REMOVED, entity);

			console.assert(self.graveyard.removedEntity.pop() == entity);
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

		return system;
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
	
	// Will destroy this world by un-initializing all the systems and destroying the objects.
	this.destroy = function () {

		// First remove systems, that way no pointless events will be called on destroying entities.
		for(var i = 0; i < m_systems.length; ++i) {
			if (m_systems[i])
				self.removeSystem(ECS.EntityManager.getSystemClassByInstance(m_systems[i]));
		}

		while(m_entities.length > 0) {
			m_entities[0].destroy();
		}

		self.blackboard = null;
	}
	

	//
	// Simple way to call delayed method as an async event.
	//
	this.executeAsync = function (handler) {

		console.assert(Object.prototype.toString.call(handler) === "[object Function]");

		pendingAsyncHandlers.push(handler);

		// Trigger execution if first in line.
		if (pendingAsyncHandlers.length == 1) {
			self.triggerAsync(ECS.EntityWorld.Events._Internal.EXECUTE_ASYNC);
		}
	}

	//
	// Private
	//
	
	var m_entities = [];
	var m_systems = new Array(20);	// Expecting no more than 20 systems...




	//
	// Execute Async
	//
	var pendingAsyncHandlers = [];
	var onAsyncExecute = function (event) {
		
		var currentAsyncHandlers = pendingAsyncHandlers;
		pendingAsyncHandlers = [];

		for(var i = 0; i < currentAsyncHandlers.length; ++i) {
			currentAsyncHandlers[i]();
		}
	}
	
	var eworldSB = this.createSubscriber();
	eworldSB.subscribe(ECS.EntityWorld.Events._Internal.EXECUTE_ASYNC, onAsyncExecute);

}

// Supported EntityWorld events that systems can subscribe to.
ECS.EntityWorld.Events = {
		SYSTEM_ADDED:				"entityworld.system_added",					// event, system
		SYSTEM_REMOVED:				"entityworld.system_removed",				// event, system
		ENTITY_ADDED:				"entityworld.entity_added",					// event, entity
		ENTITY_REFRESH:				"entityworld.entity_refresh",				// event, entity
		ENTITY_REMOVED:				"entityworld.entity_removed",				// event, entity
		ENTITY_DESTROYED:			"entityworld.entity_destroyed",				// event, entity
		ENTITY_DESTROY_FINALIZED:	"entityworld.entity_destroy_finalized",		// event, entity


		_Internal: {
			EXECUTE_ASYNC:	"entityworld._internal.execute_async",	// event
		}
};
