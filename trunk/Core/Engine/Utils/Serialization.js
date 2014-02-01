//========================================================================================================
// Serialization
//
// Simple serialization of javascript objects. Output is JSON. Has the following additional features:
// - multiple references to one object/array are saved correctly.
// - the prototype of registered classes is also saved.
// - can have custom serialize/deserialize functions per class.
// - will call postDeserialize(); prototype method on deserialized object.
// - can exclude from serialization specific classes.
// - No support for functions yet, probably never (can't recreate closure). 
// 
//========================================================================================================
"use strict";

var Serialization = new function () {
	var self = this;

	// Serialize object to JSON.
	// Will execute any custom serialize() functions along the way (attached to the class type).
	this.serialize = function (obj, prettyFormatting) {
		
		var instanceRegister = [];
		
		if (prettyFormatting) {
			return JSON.stringify(serializeImpl(obj, instanceRegister), null, '\t');
		} else {
			return JSON.stringify(serializeImpl(obj));
		}
	};
	
	// Serialize single value. Use in custom serialization functions.
	// Should pass on the custom function instanceRegister (responsible for detecting multiple references to single objects).
	this.serializeCustom = serializeImpl;
	
	
	// Deserialize object from JSON.
	// Will execute any custom deserialize() functions along the way (attached to the class type).
	// Will also call postDeserialize() after deserializing object.
	// Will fill out the outAllObjects array with all the deserialized objects (flat).
	this.deserialize = function (data, outAllObjects) {
		
		var obj = JSON.parse(data);
		
		var instanceRegister = [];
		
		var allObjects = outAllObjects || [];
		
		return deserializeImpl(obj, instanceRegister, allObjects);
	};
	
	// Deserialize single value. Use in custom deserialization functions.
	// Should pass on the custom function instanceRegister.
	// Should also pass down the array with all the deserialized objects.
	this.deserializeCustom = deserializeImpl;
	
	
	
	// Register class, in order to save the prototype.
	this.registerClass = function (classType, className) {
		
		console.assert(m_registeredClasses[className] == undefined &&
						classType.prototype.__serializationTypeName == undefined,
						classType.prototype.__serializationExclude == undefined,
						'This class is already registered!');
		
		m_registeredClasses[className] = classType;
		classType.prototype.__serializationTypeName = className;
	}
	
	// Exclude class from serializing.
	this.excludeClass = function (classType) {
		console.assert(classType.prototype.__serializationTypeName == undefined,
				classType.prototype.__serializationExclude == undefined,
				'This class is already registered!');
		
		classType.prototype.__serializationExclude = true;
	}
	
	// Exclude by key name from serializing.
	// Use with caution. Should be used mainly with primitive types and well defined naming convention.
	this.excludeKey = function (keyName) {
		
		if (m_excludedKeyNames.indexOf(keyName) == -1) {
			m_excludedKeyNames.push(keyName);
		}
	}
	
	//
	// Private
	//
	
	// Checks if the value is registered. If so, returns reference object.
	// Else, returns original object and registers it.
	var registerCheckValue = function (value, instanceRegister) {
		
		var foundIndex = instanceRegister.indexOf(value);
		if (foundIndex != -1)
			return { __serializationRefId: foundIndex };
		
		// Register this object
		instanceRegister.push(value);
		
		return value;
	};
	
	// Just registers the value.
	var registerValue = function (value, instanceRegister) {
		instanceRegister.push(value);
	}
	
	// If value is reference object, retrieve the referenced object.
	// Else return the original value object.
	var getReferenceValue = function (value, instanceRegister) {
		if (value.__serializationRefId) {
			return instanceRegister[value.__serializationRefId];
		} else {
			return value;
		}
	}
	
	// Serialize single value.
	var serializeImpl = function (value, instanceRegister) {
		
		if (Utils.isNumber(value) || Utils.isString(value) || Utils.isBoolean(value) || value == null || value == undefined) {
			return value;
		} else if (Utils.isArray(value)) {
			
			var regValue = registerCheckValue(value, instanceRegister);
			if (regValue != value)
				return regValue;
			
			var arr = [];
			for(var i = 0; i < value.length; ++i) {
				arr[i] = serializeImpl(value[i], instanceRegister);
			}
			
			return arr;
			
		} else if (Utils.isObject(value)) {
			
			// Check if this is not excluded class type.
			if (value.__serializationExclude) {
				return undefined;
			}
			
			var regValue = registerCheckValue(value, instanceRegister);
			if (regValue != value)
				return regValue;
			
			// Need to iterate in a specific order, if we want ids to match later.
			var keys = Object.keys(value).sort();
			var obj = {};
			
			// Store the info for the class.
			if (value.__serializationTypeName) {
				obj.__serializationTypeName = value.__serializationTypeName;
				
				var customSerialize = m_registeredClasses[value.__serializationTypeName].serialize;
				
				// Check if class has a custom method for serialization.
				if (customSerialize) {
					console.assert(m_registeredClasses[value.__serializationTypeName].deserialize, 'Should provide custom deserialize() method with custom serialize().')
					customSerialize(value, obj, instanceRegister);
					return obj;
				}
			}
			
			for(var i = 0; i < keys.length; ++i) {
				var fieldName = keys[i];
				
				if (m_excludedKeyNames.indexOf(fieldName) != -1) {
					continue;
				}
				
				var fieldValue = serializeImpl(value[fieldName], instanceRegister);
				
				// Serializing excluded class type will return undefined. We don't need to store that.
				if (fieldValue !== undefined)
					obj[fieldName] = fieldValue;
			}
			
			return obj;
		}
	}
	
	// Deserialize single value.
	var deserializeImpl = function (value, instanceRegister, outAllObjects) {
		
		if (Utils.isNumber(value) || Utils.isString(value) || Utils.isBoolean(value) || value == null || value == undefined) {
			return value;
		} else if (Utils.isArray(value)) {
			
			var arr = [];
			registerValue(arr, instanceRegister);
			
			for(var i = 0; i < value.length; ++i) {
				arr[i] = deserializeImpl(value[i], instanceRegister, outAllObjects);
			}
			
			return arr;
			
		} else if (Utils.isObject(value)) {
			
			var refValue = getReferenceValue(value, instanceRegister);
			if (refValue != value)
				return refValue;
			
			var obj;
			// Setup the prototype if any.
			if (value.__serializationTypeName) {
				obj = Object.create(m_registeredClasses[value.__serializationTypeName].prototype);
				delete value.__serializationTypeName;
				
				registerValue(obj, instanceRegister);
				
				// Check if class has a custom method for deserialization.
				var customDeserialize = m_registeredClasses[obj.__serializationTypeName].deserialize;
				if (customDeserialize) {
					customDeserialize(value, obj, instanceRegister, outAllObjects);
					return obj;
				}
			} else {
				obj = {};
				registerValue(obj, instanceRegister);
			}
			
			
			// Need to iterate in a specific order, if we want ids to match.
			var keys = Object.keys(value).sort();
			
			for(var i = 0; i < keys.length; ++i) {
				var fieldName = keys[i];
				obj[fieldName] = deserializeImpl(value[fieldName], instanceRegister, outAllObjects);
			}
			
			
			// Call post-deserialization method.
			if (obj.postDeserialize) {
				obj.postDeserialize();
			}
			
			outAllObjects.push(obj);
			
			return obj;
		}
	}
	
	var m_registeredClasses = {};
	var m_excludedKeyNames = []; 
}
