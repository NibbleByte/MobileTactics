//========================================================================================================
// Example Usage
//========================================================================================================
"use strict";

//-----------------------------------
/* */
 
// Example component class
// Note: components should just have data members. 
var SpatialComponent = function () {
	this.x = 0.0;
	this.y = 0.0;
};

// Registering component adds additional functionality and integration in the ECS framework.
ECS.EntityManager.registerComponent('SpatialComponent', SpatialComponent);


// -----------------------------------

var VelocityComponent = function () {
	this.xspeed = 0.0;
	this.yspeed = 0.0;
};

ECS.EntityManager.registerComponent('VelocityComponent', VelocityComponent);


// -----------------------------------

var RenderComponent = function () {
	this.outputPrefix = 'Entity: ';
};

ECS.EntityManager.registerComponent('RenderComponent', RenderComponent);


// -----------------------------------

// System should contain the functionality to manipulate the components data.
// They will be kept up-to-date by the entity world.
var MotionSystem = function () {
	
	var self = this;
	
	// This method is called when system is added to the world (instead of constructor).
	// This is a good place to make any subscriptions.
	this.onAdded = function () {
		m_world = this.getEntityWorld();
		m_entities = m_world.getEntities();
		
		m_worldSB = m_world.createSubscriber();
		
		m_worldSB.subscribe('systems.update.spatial', self.move);
	}
	
	// This method is called when system is removed from the world (instead of destructor).
	// This is a good place to clean up any subscriptions.
	this.onRemoved = function() {
		m_worldSB.unsubscribeAll();
		m_worldSB = null;
		m_entities = null;
	}
	
	// When needed for the entities to move (single frame for example),
	// this method will be called to do the work, via event.
	this.move = function () {
		
		for(var i = 0; i < m_entities.length; ++i) {
			var entity = m_entities[i];
			
			entity.SpatialComponent.x += entity.VelocityComponent.xspeed;
			entity.SpatialComponent.y += entity.VelocityComponent.yspeed;
		}
	}
	
	//
	// Private
	//
	var m_world = null;
	var m_worldSB = null;
	var m_entities = null;
}
ECS.EntityManager.registerSystem('MotionSystem', MotionSystem);


// -----------------------------------

// This system has requirements to the entities: they must have SpatialComponent and RenderComponent.
// It uses the EntityComponentFilter tool.
var RenderSystem = function () {
	
	var self = this;
	
	this.onAdded = function () {
		m_world = this.getEntityWorld();
		
		// Filter only by these components.
		m_entityFilter = new ECS.EntityComponentFilter(m_world, [SpatialComponent, RenderComponent]);
		
		m_worldSB = m_world.createSubscriber();
		
		m_worldSB.subscribe('systems.update.spatial', self.render);
	}
	
	this.onRemoved = function() {
		m_worldSB.unsubscribeAll();
		m_worldSB = null;
		m_entityFilter.destroy();
		m_entityFilter = null;
	}
	
	this.render = function () {
		
		// "Render" out the filtered components.
		for(var i = 0; i < m_entityFilter.entities.length; ++i) {
			var entity = m_entityFilter.entities[i];
			
			console.log(entity.RenderComponent.outputPrefix
					+ entity.SpatialComponent.x
					+ ', '
					+ entity.SpatialComponent.y)
		}
	}
	
	//
	// Private
	//
	var m_world = null;
	var m_worldSB = null;
	var m_entityFilter = null;
}
ECS.EntityManager.registerSystem('RenderSystem', RenderSystem);

//-----------------------------------

// Creating entity world.
var testworld = new ECS.EntityWorld();

// Creating simple entity and adding it's components. The entity is already in the world, on creation (managed).
var entity = testworld.createEntity();
entity.addComponent(SpatialComponent);
entity.addComponent(VelocityComponent);
entity.addComponent(RenderComponent);

entity.SpatialComponent.x = 2;
entity.VelocityComponent.xspeed = 1;

// Creating and adding new system.
var motionSystem = new MotionSystem();
testworld.addSystem(motionSystem);
motionSystem = testworld.getSystem(MotionSystem);

var renderSystem = new RenderSystem();
testworld.addSystem(renderSystem);

// Creating another entity. On creation, subscribed systems get notified.
var entity = testworld.createEntity();
entity.addComponent(SpatialComponent);
entity.addComponent(VelocityComponent);
entity.addComponent(RenderComponent);

entity.SpatialComponent.x = 10;
entity.VelocityComponent.xspeed = 2;

// Update the systems.
testworld.trigger('systems.update.spatial');

/* */