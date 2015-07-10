"use strict";

var CFightUnit = function CFightUnit() {
	this.unit = null;
	this.state = FightUnitState.None;
	this.direction = null;
};

ComponentsUtils.registerNonPersistent(CFightUnit);

var FightUnitState = {
	None: 0,
	Idle: 0,
	ShowingUp: 0,
	Attacking: 0,
	Hurt: 0,
	Dead: 0,
}

Enums.enumerate(FightUnitState);