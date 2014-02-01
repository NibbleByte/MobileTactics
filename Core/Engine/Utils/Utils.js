//===============================================
// Utils
// Figure it out.
//===============================================
"use strict";

var Utils = {
		
	//
	// Check types
	//
	isArray: function(object) {
		return Object.prototype.toString.call(object) === '[object Array]';
	},

	isString: function(object) {
		return Object.prototype.toString.call(object) === '[object String]';
	},

	isBoolean: function(object) {
		return Object.prototype.toString.call(object) === '[object Boolean]';
	},

	isNumber: function(object) {
		return Object.prototype.toString.call(object) === '[object Number]';
	},

	isFunction: function(object) {
		return Object.prototype.toString.call(object) === "[object Function]";
	},

	isObject: function(object) {
		return object !== null && object !== undefined &&
			!this.isArray(object) && !this.isBoolean(object) &&
			!this.isString(object) && !this.isNumber(object) &&
			!this.isFunction(object);
	},
	
	
	//
	// Invalidate objects
	//
	invalidateFunction: function () {
		console.error('Function call to invalidated object.');
	},
	
	// Calling this function to object, invalidates it,
	// so it cannot be used anymore (to avoid old refs). 
	invalidate: function (obj) {
		for(var key in obj) {
			var value = obj[key];
			
			if (this.isFunction(value)) {
				obj[key] = this.invalidateFunction;
			} else {
				delete obj[key];
			}
		}
		
		obj.__INVALID__ = 'INVALID';
	},
};
