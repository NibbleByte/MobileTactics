"use strict";

var CAIData = function CAIData() {
	this.reset();
};

ComponentsUtils.registerNonPersistent(CAIData);



// Short-cut for resetting
CAIData.prototype.reset = function () {
	this.task = null;
	this.action = null;
}