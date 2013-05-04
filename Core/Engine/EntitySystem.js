//========================================================================================================
// EntitySystem
// Provides entity/component based objects system.
//
// EntityManager: 		Manages entities and their components.
//
// Entity:				A single entity that may have multiple components attached to it.
// 						Depending on what components it has attached, the entity methods may vary.
//
// Component: 			Class attached to an entity, responsible for some functionality.
//			  			Component methods are exported to the entity as its own methods.
//
// Message:	  			Message is a method of a component that will be exported to an entity.
//						User (and components) communicates with components of a given entity via messages.
//						Messages can be Unicast or Multicast.
//						Unicast messages means only 1 handler with the highest bid will be executed.
//						Multicast - all handlers will be executed. Note: Multicast messages can't return value.
//
// Unicast Bid:			One message can be implemented by a multiple components in a given entity.
//						In order to decide which one to export, messages have bids.
//						The message with the highest bid will be exported as an entity method.
//
// Multicast Bid:		Multicast instead of executing only one message, all messages are executed.
//						The order of their execution depends on their bids. The highest bid is first.
//
// Dependencies:		A given component may have multiple dependencies of other components.
//						When that component is added to an entity, it's dependencies are added first, recursively.
// 
// Example usage:		Check out the bottom of the file.
// 
//========================================================================================================
"use strict";

var Entity = function () {
	this._components = {};
	this._uMessages = {};
	this._mMessages = {};
	
	EntityManager.addComponents(this, CEntity);
}

Entity.prototype.getComponentByName = function (componentName) {
	return this._components[componentName];
}

Entity.prototype.getComponentById = function (componentId) {
	return this._components[EntityManager.getComponentNameById(componentId)];
}




var EntityManager = new function () {
	var self = this;
	
	// Register class as a entity component.
	// After registering a user class as a component, additional methods are provided.
	// For more info, check out the examples.
	// 		name - name of the component. Can use namespaces: "Unit.UnitRendering"
	// 		componentClass - class of the component to be registered.
	this.registerComponent = function (name, componentClass) {
		console.assert(typeof name == 'string')
		
		componentClass.prototype._COMP_NAME = name;
		componentClass.prototype._COMP_ID = m_registeredComponents.length;
		componentClass.prototype.UMessage = UMessage;
		componentClass.prototype.MMessage = MMessage;
		componentClass.prototype.getNextBid = getNextBid;
		componentClass.prototype.getComponentName = getComponentName;
		componentClass.prototype.getComponentId = getComponentId;
		
		m_registeredComponents.push(componentClass);
	}
	
	this.getComponentNameById = function (componentId) {
		return m_registeredComponents[componentId].prototype._COMP_NAME;
	}
	
	// Add dependencies to a given component.
	// 		argument[0] - target component class
	// 		argument[1...] - dependent component classes
	this.addComponentDependencies = function (variableArguments) {
		
		var target = arguments[0];
		var dependencies = Array.prototype.slice.call(arguments, 1);
		
		console.assert(self.isComponentClass(target));
		
		m_dependencies[target.prototype._COMP_NAME] = m_dependencies[target.prototype._COMP_NAME] || [];
		
		// TODO: No check for circular dependencies. 
		m_dependencies[target.prototype._COMP_NAME] = _.union(m_dependencies[target.prototype._COMP_NAME], dependencies);
		
	}
	
	// Add components to a given entity. Adds also their dependencies.
	// 		argument[0] - target entity
	// 		argument[1...] - desired component classes
	this.addComponents = function(variableArguments) {
		
		var entity = arguments[0];
		var components = Array.prototype.slice.call(arguments, 1);
		
		for(var i = 0; i < components.length; ++i) {
			var componentClass = components[i];
			
			appendDependencies(entity, componentClass);
		}
	}
	
	// Removes components from a given entity.
	// Note: does not remove dependencies (not cascade).
	// 		argument[0] - target entity
	// 		argument[1...] - desired component classes
	this.removeComponents = function(variableArguments) {
		
		var entity = arguments[0];
		var components = Array.prototype.slice.call(arguments, 1);
		
		for(var i = 0; i < components.length; ++i) {
			var componentClass = components[i];
			console.assert(self.isComponentClass(componentClass));
			
			// TODO: remove messages
			console.assert(false, 'Not implemented yet!');
			delete entity._components[componentClass.prototype._COMP_NAME];
		}
		
	}
	
	// Default bid for all messages
	this.DEFAULT_CALL_BID = 0;
	
	this.isComponentClass = function(obj) {
		return !!obj.prototype._COMP_NAME;
	}
	
	this.isComponent = function(obj) {
		return !!obj.UMessage;
	}
	
	this.isEntity = function(obj) {
		return obj instanceof Entity;
	}
	
	this.isUMessage = function(obj) {
		return !!obj._messageName;
	}
	
	this.isMMessage = function(obj) {
		return !!obj._multiMessageName;
	}
	
	
	
	
	//
	// Private
	// 
	var m_registeredComponents = [];
	var m_dependencies = {};
	
	
	// Add dependencies to a given entity recursively.
	var appendDependencies = function(entity, componentClass) {
		console.assert(self.isEntity(entity));
		console.assert(self.isComponentClass(componentClass));
		
		// Check for dependencies
		var dependencies = m_dependencies[componentClass.prototype._COMP_NAME];
		for(var dependencyName in dependencies) {
			appendDependencies(entity, dependencies[dependencyName]);
		}
		
		// Skip if component already added
		if (entity._components[componentClass.prototype._COMP_NAME]) {
			return;
		}
		
		
		// Finally, add the component
		var component = new componentClass(entity);
		entity._components[componentClass.prototype._COMP_NAME] = component;
		
		applyUMessages(entity, component);
		applyMMessages(entity, component);
	}
	
	// Export UMessages to entity
	var applyUMessages = function(entity, component) {
		
		// Copy all messages from the component to the entity
		var uMessages = component._uMessages || {};
		for(var messageName in uMessages) {
			var uMessage = uMessages[messageName];
			
			// Analyze message
			var entityMessage = entity[messageName];
			if (entityMessage) {
				console.assert(self.isUMessage(entityMessage), 'UMessage name clashing with non-UMessage property: ' + messageName);
				console.assert(entityMessage._messageBid != uMessage._messageBid, 'Messages with equal bid is not allowed:' + messageName);
				
				// Override only if has higher bid
				if (entityMessage._messageBid < uMessage._messageBid)
					entity[messageName] = uMessage;
				 
			} else {
				entity[messageName] = uMessage;
			}
			
			// Store (sorted) message for future use
			entity._uMessages[messageName] = entity._uMessages[messageName] || [];
			var messages = entity._uMessages[messageName];
			messages.splice(
					_.sortedIndex(messages, uMessage, function (value) {return value._messageBid;}),
					0, 
					uMessage);
		}
		
	}
	
	// Export MMessages to entity
	var applyMMessages = function(entity, component) {
		
		// Copy all messages from the component to the entity
		var mMessages = component._mMessages || {};
		for(var messageName in mMessages) {
			var mMessage = mMessages[messageName];
			
			// Analyze message
			var entityMessage = entity[messageName];
			if (entityMessage) {
				console.assert(self.isMMessage(entityMessage), 'MMessage name clashing with non-MMessage property: ' + messageName);
				
				entity[messageName] = multiMessageHandlerFactory(entity, messageName);
				 
			} else {
				// If the only multi-cast message, copy method directly. 
				entity[messageName] = mMessage;
			}
			
			// Store (sorted) message for future use
			entity._mMessages[messageName] = entity._mMessages[messageName] || [];
			var messages = entity._mMessages[messageName];
			messages.splice(
					_.sortedIndex(messages, mMessage, function (value) {return value._messageBid;}),
					0, 
					mMessage);
		}
		
	}
	
	// Produces handler to be exported for multicast messages.
	var multiMessageHandlerFactory = function (entity, messageName) {
		var handler = function () {
			var messages = entity._mMessages[messageName];
			console.assert(messages.length > 0);
			
			var i = messages.length;
			while(i) {
				messages[i - 1].apply(this, Array.prototype.slice.call(arguments));
				--i;
			}
		}
		
		handler._multiMessageName = messageName;
		return handler;
	}
	
	//
	// Component added methods
	//
	
	// User provided method for creating messages out of functions.
	var UMessage = function(name, handler, bid) {
		console.assert(typeof name == 'string' && name != '');
		console.assert(handler instanceof Function);
		
		bid = bid || self.DEFAULT_CALL_BID;
		
		handler._messageName = name;
		handler._messageBid = bid;
		
		this._uMessages = this._uMessages || {};
		console.assert(!this._uMessages[name], 'Duplicate message: ' + name);
		this._uMessages[name] = handler;
	}
	
	// User provided method for creating multi-messages out of functions.
	var MMessage = function(name, handler, bid) {
		console.assert(typeof name == 'string' && name != '');
		console.assert(handler instanceof Function);
		
		bid = bid || self.DEFAULT_CALL_BID;
		
		handler._multiMessageName = name;
		handler._messageBid = bid;
		
		this._mMessages = this._mMessages || {};
		console.assert(!this._mMessages[name], 'Duplicate message: ' + name);
		this._mMessages[name] = handler;
	}
	
	// User provided method for getting next message by bid.
	var getNextBid = function(entity, uMessage) {		
		console.assert(self.isUMessage(uMessage));

		var name = uMessage._messageName;
		
		var messages = entity._uMessages[name];
		var nextBidIndex = _.sortedIndex(messages, uMessage, function (value) { return value._messageBid; }) - 1;
		if (nextBidIndex >= 0)
			return messages[nextBidIndex];
	}
	
	var getComponentName = function () {
		return this._COMP_NAME;
	}
	
	var getComponentId = function () {
		return this._COMP_ID;
	}
};

///////////////////////////////////////////////////
// CEntity component
// Provides default entity functionality.
// Attached to every entity.
///////////////////////////////////////////////////
var CEntity = function (entity) {
	var self = this;
	
	this.MMessage('destroy', function () {
		// Default, do nothing.
	});	
};

EntityManager.registerComponent('CEntity', CEntity);

//========================================================================================================
// Example Usage:
//========================================================================================================
//-----------------------------------
/* */
 
// Example component class
// Note: component receives entity that is attached to as a constructor argument. 
var UnitComponent = function (go_this) {
	var self = this;
	
	// Note: component methods are exposed using the UMessage method,
	// gained during component registration.
	this.UMessage('move', function (pos) {
		console.log("Move: " + pos);
		
		return pos / 2;
	}, 102);
	
	this.MMessage('destroy', function () {
		console.log('Destroy Unit!');
	});
};

// Registering component adds additional methods to the component such as:
// 		UMessage(name, handler, bid);
//		getNextBid(entity, callee);
EntityManager.registerComponent('Unit.UnitComponent', UnitComponent);

// -----------------------------------

var UnitRenderingComponent = function (go_this) {
	var self = this;
	
	// Note: if no bid is passed, default is taken, which is 0.
	this.UMessage('render', function () {
		console.log("Render");
	});
	
	this.MMessage('destroy', function () {
		console.log('Destroy UnitRendering!');
	});
};

EntityManager.registerComponent('Unit.UnitRenderingComponent', UnitRenderingComponent);

// -----------------------------------

var UnitGameplayComponent = function (go_this) {
	var self = this;
	
	// Note: this message has higher bid,
	// so it will overwrite the UnitComponent 'move' method.
	this.UMessage('move', function moveMsg(pos) {		
		// Note: this would call the same message with next bid.
		pos = self.getNextBid(go_this, moveMsg)(pos);
		
		console.log("Gameplay Move: " + pos);
		
		return pos / 2;
	}, 105);
	
	this.MMessage('destroy', function () {
		console.log('Destroy UnitGameplay!');
	});
};

EntityManager.registerComponent('Unit.UnitGameplayComponent', UnitGameplayComponent);

// -----------------------------------

var UnitGameplayMovementComponent = function (go_this) {
	
};

EntityManager.registerComponent('Unit.UnitGameplayMovementComponent', UnitGameplayMovementComponent);

// -----------------------------------

// Adding dependencies.
EntityManager.addComponentDependencies(UnitComponent, UnitRenderingComponent);
EntityManager.addComponentDependencies(UnitComponent, UnitGameplayComponent);
EntityManager.addComponentDependencies(UnitGameplayComponent, UnitGameplayMovementComponent);

// Creating simple entity and adding it's components.
// Note: because all the components are dependent on UnitComponent, they all will be added.
var entity = new Entity();
EntityManager.addComponents(entity, UnitComponent);
/* */