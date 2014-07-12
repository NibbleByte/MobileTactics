//===============================================
// Array
// Add some additional functionality (and fixes) to default array.
//===============================================
"use strict";

Array.prototype.remove = function(value) {
	var index = this.indexOf(value);
	if (index > -1)
		this.splice(index, 1);
};

Array.prototype.removeLast = function(value) {
	var index = this.lastIndexOf(value);
	if (index > -1)
		this.splice(index, 1);
};

Array.prototype.removeAt = function(index) {
	this.splice(index, 1);
};

Array.prototype.contains = function (val) {
	return this.indexOf(val) != -1;
}

Array.prototype.clear = function() {
	var len = this.length;
	for(var i = 0; i < len; i++) {
		this.pop();
	}
};

// IE8 and earlier fix
if (!Array.prototype.indexOf) { 
	Array.prototype.indexOf = function(obj, start) {
		for (var i = (start || 0), j = this.length; i < j; i++) {
			if (this[i] === obj) { return i; }
		}
		return -1;
	}
}