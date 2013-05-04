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
	}
};