"use strict";

var CFightUnit = function CFightUnit() {
	this.unit = null;
	this.state = FightUnitState.None;
	this.direction = null;
	this.battleStats = null;
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

var FightUnitWeaponType = {
	None: 0,

	Pistols: 0,
	Shotgun: 0,
	MachineGun: 0,
	Flamethrower: 0,
	RocketLauncher: 0,

	LaserRifle: 0,

	Claws: 0,
	AcidSpit: 0,
}

Enums.enumerate(FightUnitState);