//========================================================================================================
// EntityManager
// 
// Static class, providing some utilities and a way to integrate user classes into the system.
// Before using any class as a component or system, it first need to be registered as such.
//========================================================================================================
"use strict";
var ECS = ECS || {};

ECS.EntityManager = new function () {
	var self = this;
		
	// Register class as a entity component.
	// After registering a user class as a component, additional methods are provided.
	// For more info, check out the examples.
	// 		name - a valid variable name of the component. (no nested components allowed, no '.' etc) 
	// 		componentClass - class of the component to be registered.
	this.registerComponent = function (name, componentClass) {
		console.assert(typeof name == 'string')
		
		componentClass.prototype._COMP_NAME = name;
		componentClass.prototype._COMP_ID = m_registeredComponents.length;
		componentClass.prototype.getComponentName = ECS.EntityManager._getComponentName;
		componentClass.prototype.getComponentId = ECS.EntityManager._getComponentId;
		
		m_registeredComponents.push(componentClass);
	}
	
	// Register class as a system.
	// After registering a user class as a system, additional methods are provided.
	// For more info, check out the examples.
	// 		name - a valid variable name of the system. 
	// 		systemClass - class of the system to be registered.
	this.registerSystem = function (name, systemClass) {
		console.assert(typeof name == 'string')
		
		systemClass.prototype._SYS_NAME = name;
		systemClass.prototype._SYS_ID = m_registeredSystems.length;
		systemClass.prototype.getSystemName = ECS.EntityManager._getSystemName;
		systemClass.prototype.getSystemId = ECS.EntityManager._getSystemId;
		systemClass.prototype.getEntityWorld = ECS.EntityManager._getEntityWorld;
		
		m_registeredSystems.push(systemClass);
	}
	
	// Get component class name
	this.getComponentClassName = function (componentClass) {
		return componentClass.prototype._COMP_NAME;
	}
	
	// Check if this object is valid component class.
	this.isComponentClass = function(obj) {
		return !!obj.prototype._COMP_NAME;
	}
	
	// Check if this object is valid component.
	this.isComponent = function(obj) {
		return !!obj._COMP_NAME;
	}
	
	// Check if this object is valid system class.
	this.isSystemClass = function(obj) {
		return !!obj.prototype._SYS_NAME;
	}
	
	// Check if this object is valid system.
	this.isSystem = function(obj) {
		return !!obj._SYS_NAME;
	}
	
	// Check if this object is valid entity.
	this.isEntity = function(obj) {
		return obj instanceof ECS.Entity;
	}
	
	
	// Expose what classes/systems were registered till now.
	this.getRegisteredComponents = function () {
		return m_registeredComponents;
	};
	
	this.getRegisteredSystems = function () {
		return m_registeredSystems;
	};
	
	//
	// Private
	// 
	var m_registeredComponents = [];
	var m_registeredSystems = [];
};



//
// Components
//

ECS.EntityManager._getComponentName = function () {
	return this._COMP_NAME;
}

ECS.EntityManager._getComponentId = function () {
	return this._COMP_ID;
}


//
// Systems
//

ECS.EntityManager._getSystemName = function () {
	return this._COMP_NAME;
}

ECS.EntityManager._getSystemId = function () {
	return this._COMP_ID;
}

ECS.EntityManager._getEntityWorld = function () {
	return this._entityWorld;
}