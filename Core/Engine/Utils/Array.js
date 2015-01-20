//===============================================
// Array
// Add some additional functionality (and fixes) to default array.
//===============================================
"use strict";

Array.prototype.remove = Array.prototype.remove || function(value) {
	var index = this.indexOf(value);
	if (index > -1)
		this.splice(index, 1);

	return index > -1;
};

Array.prototype.removeLast = Array.prototype.removeLast || function(value) {
	var index = this.lastIndexOf(value);
	if (index > -1)
		this.splice(index, 1);

	return index > -1;
};

Array.prototype.removeAt = Array.prototype.removeAt || function(index) {
	this.splice(index, 1);
};

Array.prototype.contains = Array.prototype.contains || function (val) {
	return this.indexOf(val) != -1;
}

Array.prototype.clear = Array.prototype.clear || function() {
	var len = this.length;
	for(var i = 0; i < len; i++) {
		this.pop();
	}
};

// Returns the first element of an array that satisfies given predicate
Array.prototype.find = Array.prototype.find || function (predicate) {
	if (typeof predicate !== 'function') {
		return undefined;
	}

	for (var i = 0; i < this.length; i++) {
		if (i in this && predicate(this[i])) return this[i];
	}

	return undefined;
}

// Returns array of elements that satisfy given predicate
Array.prototype.findAll = Array.prototype.findAll || function (predicate) {
	if (typeof predicate !== 'function') {
		return [];
	}

	var ret = [];
	for (var i = 0; i < this.length; i++) {
		if (i in this && predicate(this[i])) ret.push(this[i]);
	}

	return ret;
}

Array.prototype.last = function () {
	return this[this.length - 1];
}

Array.prototype.clone = function () {
	return this.slice(0);
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