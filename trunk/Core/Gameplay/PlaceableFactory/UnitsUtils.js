//===============================================
// UnitsUtils.js
// Provides helpful methods for units and their definitions.
//===============================================
"use strict";

var UnitsUtils = {

	// Returns BASE attack statistic depending on enemy unit type.
	getAttackBase: function (unit, typeOrUnit) {

		// Recognize unit
		if (typeOrUnit.CUnit) {
			typeOrUnit = typeOrUnit.CUnit.getType();
		}

		return unit.CStatistics.baseStatistics[UnitTypeStatNames[typeOrUnit]];
	},


	// Returns attack statistic depending on enemy unit type.
	getAttack: function (unit, typeOrUnit) {

		// Recognize unit
		if (typeOrUnit.CUnit) {
			typeOrUnit = typeOrUnit.CUnit.getType();
		}

		return unit.CStatistics.statistics[UnitTypeStatNames[typeOrUnit]];
	},


	// Returns if unit can attack depending on enemy unit type.
	canAttackType: function (unit, typeOrUnit) {
		return UnitsUtils.getAttackBase(unit, typeOrUnit) !== undefined;
	}
}