"use strict";

var CAnimations = function CAnimations() {	
	this.animators = {};	
};

ComponentsUtils.registerNonPersistent(CAnimations);

CAnimations.prototype.destroy = function () {
	for (var name in this.animators) {
		this.animators[name].destroy();
	}
	this.animators = {};
}

CAnimations.prototype.add = function (animatorName, animator) {
	this.animators[animatorName] = animator;
}

CAnimations.prototype.remove = function (animatorName) {
	this.animators[animatorName].destroy();
	delete this.animators[animatorName];
}