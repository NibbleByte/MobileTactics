//===============================================
// Subscriber
// Helps around building enums
//===============================================
"use strict";

var Enums = {
	enumerate: function (enumObj) {
		var counter = 0;
		for(var i in enumObj) {
			enumObj[i] = counter;
			counter++;
		}
	},
	
	count: function (enumClass) {
		var counter = 0;
		for(var i in enumClass) {
			counter++;
		}
		
		return counter;
	},
	
	isValidValue: function(enumClass, enumValue) {
		for(var key in enumClass) {
			if (enumClass[key] == enumValue) {
				return true;
			}
		}
		
		return false;
	},
	
	getName: function (enumClass, enumValue) {
		
		for(var name in enumClass) {
			if (enumClass[name] == enumValue) {
				return name;
			}
		}
		
		return '';
	}
};