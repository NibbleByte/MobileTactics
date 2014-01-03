"use strict";

var CTile = function () {
	this.row = -1;
	this.column = -1;
	
	this.placedObjects = [];
};

ComponentsUtils.registerPersistent('CTile', CTile);



// Short-cut for removing object from collection.
CTile.prototype.removeObject = function (placeable) {
	var foundIndex = this.placedObjects.indexOf(placeable);
	
	if (foundIndex == -1)
		return false;
	
	this.placedObjects.splice(foundIndex, 1);
	
	return true;
}