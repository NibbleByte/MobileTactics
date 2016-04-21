//===============================================
// UnitsUtils.js
// Provides helpful methods for units and their definitions.
//===============================================
"use strict";

var UnitsUtils = {

	getAttackStatName: function (unitTypeOrDefinition) {

		if (unitTypeOrDefinition.type != undefined && unitTypeOrDefinition.name) {
			unitTypeOrDefinition = unitTypeOrDefinition.type;
		}

		return UnitsDefinitions.AttackStatNamesByType[unitTypeOrDefinition];
	},

	// Returns BASE attack statistic depending on enemy unit type.
	getAttackBase: function (unit, typeOrUnit) {

		// Recognize unit
		if (typeOrUnit.CUnit) {
			typeOrUnit = typeOrUnit.CUnit.getType();
		}

		return unit.CStatistics.baseStatistics[UnitsDefinitions.AttackStatNamesByType[typeOrUnit]];
	},

	isStrongVS: function (attacker, defender) {
		return attacker.CUnit.getDefinition().strongVS.contains(defender.CUnit.getDefinition().category);
	},

	isWeakVS: function (attacker, defender) {
		return attacker.CUnit.getDefinition().weakVS.contains(defender.CUnit.getDefinition().category);
	},


	// Returns attack statistic depending on enemy unit type.
	getAttack: function (unit, typeOrUnit) {

		// Recognize unit
		if (typeOrUnit.CUnit) {
			typeOrUnit = typeOrUnit.CUnit.getType();
		}

		return unit.CStatistics.statistics[UnitsDefinitions.AttackStatNamesByType[typeOrUnit]];
	},


	// Returns if unit can attack depending on enemy unit type.
	canAttackType: function (unit, typeOrUnit) {
		return UnitsUtils.getAttackBase(unit, typeOrUnit) !== undefined;
	}
}