"use strict";

var CBattleUnit = function CBattleUnit() {
	this.unit = null;
	this.killed = false;
};

ComponentsUtils.registerNonPersistent(CBattleUnit);
