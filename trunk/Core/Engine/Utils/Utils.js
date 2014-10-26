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


	simpleCopyMembers: function (sourceObj) {
		var destObj = {};

		for(var member in sourceObj) {
			destObj[member] = sourceObj[member];
		}

		return destObj;
	},

	stringifyShallow: function (obj) {
		if (this.isObject(obj)) {
			var ret = '{\n';

			var keys = Object.keys(obj);
			for(var i = 0; i < keys.length; ++i) {
				var val = obj[keys[i]];
				ret += keys[i] + ': ';
				if (this.isObject(val)) ret += '[Object] <' + val.constructor.name + '>';
				if (this.isArray(val)) ret += '[Array] <' + val.length + '>';
				if (!this.isObject(val) && !this.isArray(val)) ret += val;

				ret += ', \n';
			}

			ret += '}'
			return ret;

		} else {
			return obj.toString();
		}
	},


	// Returns the value of random property of the given object
	randomPropertyValue: function (obj) {
		var keys = Object.keys(obj);
		return obj[keys[ keys.length * Math.random() << 0]];
	},
	
	// Returns !expression, so you can easely if(...) { return; }
	assert: function (expression, message) {
		console.assert(expression, message);

		return !expression;
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

	isInvalidated: function (obj) {
		return !!obj.__INVALID__;
	}
};
