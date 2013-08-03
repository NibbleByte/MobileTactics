"use strict";

var CUnit = function () {
	// TODO: Initialize health from elsewhere
	this.health = 10;
};

ECS.EntityManager.registerComponent('CUnit', CUnit);
