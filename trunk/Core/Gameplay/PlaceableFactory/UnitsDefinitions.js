//===============================================
// UnitsDefinitions.js
// Factory for creating units.
//===============================================
"use strict";

var UnitType = {
	Light: 0,
	Heavy: 0,
	Aerial: 0,
	Naval: 0,
};
Enums.enumerate(UnitType);

var UnitTypeStatNames = [];
UnitTypeStatNames[UnitType.Light] = 'AttackLight';
UnitTypeStatNames[UnitType.Heavy] = 'AttackHeavy';
UnitTypeStatNames[UnitType.Aerial] = 'AttackAerial';
UnitTypeStatNames[UnitType.Naval] = 'AttackNaval';

var UnitsDefinitions = [];
var GenericUnits = [];	// Contains the definitions of all generic units (i.e. basic race unit that can be used in generic maps).

UnitsDefinitions[Player.Races.Developers] = {

	WarMiner: {
		race: 0,
		name: '@!@',
		price: 200,
		type: UnitType.Heavy,

		baseStatistics: {
			AttackLight: 6,
			AttackHeavy: 4,
			AttackAerial: 2,
			AttackRange: 2,
			HealRate: 2,
			Defence: 12,
			Movement: 3,
			Visibility: 3,

			TurnPoints: 2,
		},
		
		actions: [
				  Actions.Classes.ActionMove,
				  Actions.Classes.ActionStay,
				  Actions.Classes.ActionAttack,
				  Actions.Classes.ActionHeal,
				 ],
		
		terrainStats: new function () {
			this[GameWorldTerrainType.Plains] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Mountain] =	{ Cost: 3, Attack: 0, Defence: 1};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: 0, Defence: 1};
			this[GameWorldTerrainType.Rough] =		{ Cost: 3, Attack: -1, Defence: -2};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.HQ] =			{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Factory] =	{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: 0};
		},
	}, 
	
	RhinoTank: {
		race: 0,
		name: '@!@',
		price: 500,
		type: UnitType.Heavy,

		baseStatistics: {
			AttackLight: 10,
			AttackHeavy: 8,
			AttackRange: 3,
			Defence: 10,
			Movement: 4,
			MovementAttack: 2,
			Visibility: 4,
		},
		
		actions: [
				  Actions.Classes.ActionMove,
				  Actions.Classes.ActionStay,
				  Actions.Classes.ActionAttack,
				  Actions.Classes.ActionHeal,
				 ],
		
		terrainStats: new function () {
			this[GameWorldTerrainType.Plains] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Rough] =		{ Cost: 3, Attack: -1, Defence: -2};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.HQ] =			{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Factory] =	{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: 0};
		},
	},
	
	TeslaTrooper: {
		race: 0,
		name: '@!@',
		price: 250,
		type: UnitType.Light,

		baseStatistics: {
			AttackLight: 6,
			AttackHeavy: 4,
			AttackAerial: 5,
			AttackRange: 1,
			Defence: 6,
			Movement: 3,
			Visibility: 3,
		},
		
		actions: [
				  Actions.Classes.ActionCapture,
				  Actions.Classes.ActionMove,
				  Actions.Classes.ActionStay,
				  Actions.Classes.ActionAttack,
				  Actions.Classes.ActionHeal,
				 ],
		
		terrainStats: new function () {
			this[GameWorldTerrainType.Plains] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: 0, Defence: 1};
			this[GameWorldTerrainType.Mountain] =	{ Cost: 2, Attack: 1, Defence: 1};
			this[GameWorldTerrainType.Rough] =		{ Cost: 2, Attack: -2, Defence: -3};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.HQ] =			{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Factory] =	{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Harbour] =	{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.WatchTower] = { Cost: 1, Attack: 0, Defence: 0};
		},
	},
};


UnitsDefinitions[Player.Races.Empire] = {

	PeaceKeeper: {
		race: 0,
		name: '@!@',
		price: 100,
		type: UnitType.Light,

		baseStatistics: {
			AttackLight: 5,
			AttackHeavy: 4,
			AttackAerial: 3,
			AttackRange: 1,
			HealRate: 1,
			Defence: 4,
			Movement: 4,
			Visibility: 4,
		},
		
		actions: [
				  Actions.Classes.ActionCapture,
				  Actions.Classes.ActionMove,
				  Actions.Classes.ActionStay,
				  Actions.Classes.ActionAttack,
				  Actions.Classes.ActionHeal,
				 ],
		
		terrainStats: new function () {
			this[GameWorldTerrainType.Plains] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: 1, Defence: 2};
			this[GameWorldTerrainType.Mountain] =	{ Cost: 3, Attack: 2, Defence: 3};
			this[GameWorldTerrainType.Rough] =		{ Cost: 3, Attack: -2, Defence: -2};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 1, Defence: 2};
			this[GameWorldTerrainType.HQ] =			{ Cost: 1, Attack: 1, Defence: 2};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 1, Attack: 1, Defence: 1};
			this[GameWorldTerrainType.Factory] =	{ Cost: 1, Attack: 1, Defence: 1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 1, Defence: 0};
		},

		AIHints: {
			preferedMinCount: 2,
		},
	},
	
	Ranger: {
		race: 0,
		name: '@!@',
		price: 250,
		type: UnitType.Heavy,

		baseStatistics: {
			AttackLight: 8,
			AttackHeavy: 5,
			AttackAerial: 6,
			AttackRange: 1,
			HealRate: 1,
			Defence: 4,
			Movement: 6,
			Visibility: 6,

			TurnPoints: 2,
		},
		
		actions: [
				  Actions.Classes.ActionMove,
				  Actions.Classes.ActionStay,
				  Actions.Classes.ActionAttack,
				  Actions.Classes.ActionHeal,
				 ],
		
		terrainStats: new function () {
			this[GameWorldTerrainType.Plains] =		{ Cost: 1, Attack: 1, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: -1, Defence: -1};
			this[GameWorldTerrainType.Rough] =		{ Cost: 3, Attack: -2, Defence: -2};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.HQ] =			{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Factory] =	{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: -1};
		},
	},

	HoverCannon: {
		race: 0,
		name: '@!@',
		price: 450,
		type: UnitType.Heavy,

		baseStatistics: {
			AttackLight: 7,
			AttackHeavy: 6,
			AttackAerial: 8,
			AttackRange: 2,
			HealRate: 1,
			Defence: 6,
			Movement: 4,
			Visibility: 6,
		},
		
		actions: [
				  Actions.Classes.ActionMove,
				  Actions.Classes.ActionStay,
				  Actions.Classes.ActionAttack,
				  Actions.Classes.ActionHeal,
				 ],
		
		terrainStats: new function () {
			this[GameWorldTerrainType.Plains] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: -2, Defence: -1};
			this[GameWorldTerrainType.Rough] =		{ Cost: 3, Attack: -2, Defence: -3};
			this[GameWorldTerrainType.Water] =		{ Cost: 2, Attack: -1, Defence: -2};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.HQ] =			{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Factory] =	{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: 1};
		},
	},

	Comanche: {
		race: 0,
		name: '@!@',
		price: 400,
		type: UnitType.Aerial,

		baseStatistics: {
			AttackLight: 6,
			AttackHeavy: 9,
			AttackAerial: 8,
			AttackRange: 1,
			HealRate: 1,
			Defence: 6,
			Movement: 5,
			Visibility: 6,
		},
		
		actions: [
				  Actions.Classes.ActionMove,
				  Actions.Classes.ActionStay,
				  Actions.Classes.ActionAttack,
				  Actions.Classes.ActionHeal,
				 ],
		
		terrainStats: new function () {
			this[GameWorldTerrainType.Plains] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Mountain] =	{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Rough] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Water] =		{ Cost: 1, Attack: 0, Defence: 0};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.HQ] =			{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Factory] =	{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: 0};
		},
	},

	IonDrone: {
		race: 0,
		name: '@!@',
		price: 600,
		type: UnitType.Heavy,

		disableMoveAttack: true,

		baseStatistics: {
			AttackLight: 7,
			AttackHeavy: 10,
			AttackAerial: 7,
			AttackRange: 6,
			AttackRangeMin: 2,
			HealRate: 1,
			Defence: 2,
			Movement: 4,
			Visibility: 6,
		},
		
		actions: [
				  Actions.Classes.ActionMove,
				  Actions.Classes.ActionStay,
				  Actions.Classes.ActionAttack,
				  Actions.Classes.ActionHeal,
				 ],
		
		terrainStats: new function () {
			this[GameWorldTerrainType.Plains] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: -2, Defence: -1};
			this[GameWorldTerrainType.Rough] =		{ Cost: 3, Attack: -2, Defence: -3};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.HQ] =			{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Factory] =	{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: 0};
		},

		AIHints: {
			guardsNeeded: 4,
		}
	},
};



UnitsDefinitions[Player.Races.JunkPeople] = {

	FlakTrooper: {
		race: 0,
		name: '@!@',
		price: 100,
		type: UnitType.Light,

		baseStatistics: {
			AttackLight: 4,
			AttackHeavy: 6,
			AttackAerial: 6,
			AttackRange: 2,
			HealRate: 1,
			Defence: 3,
			Movement: 3,
			Visibility: 4,
		},
		
		actions: [
				  Actions.Classes.ActionCapture,
				  Actions.Classes.ActionMove,
				  Actions.Classes.ActionStay,
				  Actions.Classes.ActionAttack,
				  Actions.Classes.ActionHeal,
				 ],
		
		terrainStats: new function () {
			this[GameWorldTerrainType.Plains] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: 0, Defence: 1};
			this[GameWorldTerrainType.Mountain] =	{ Cost: 3, Attack: 1, Defence: 2};
			this[GameWorldTerrainType.Rough] =		{ Cost: 3, Attack: -2, Defence: -2};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 1, Defence: 2};
			this[GameWorldTerrainType.HQ] =			{ Cost: 1, Attack: 1, Defence: 2};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 1, Attack: 1, Defence: 2};
			this[GameWorldTerrainType.Factory] =	{ Cost: 1, Attack: 1, Defence: 2};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 1, Defence: 0};
		},

		AIHints: {
			preferedMinCount: 3,
		},
	},

	Biker: {
		race: 0,
		name: '@!@',
		price: 200,
		type: UnitType.Light,

		baseStatistics: {
			AttackLight: 5,
			AttackHeavy: 3,
			AttackAerial: 4,
			AttackRange: 1,
			HealRate: 1,
			Defence: 3,
			Movement: 5,
			Visibility: 6,
			MovementAttack: 2,
		},
		
		actions: [
				  Actions.Classes.ActionMove,
				  Actions.Classes.ActionStay,
				  Actions.Classes.ActionAttack,
				  Actions.Classes.ActionHeal,
				 ],
		
		terrainStats: new function () {
			this[GameWorldTerrainType.Plains] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: 1, Defence: 0};
			this[GameWorldTerrainType.Mountain] =	{ Cost: 2, Attack: 1, Defence: 0};
			this[GameWorldTerrainType.Rough] =		{ Cost: 3, Attack: -2, Defence: -2};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.HQ] =			{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Factory] =	{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: -1};
		},
	},

	ScrapTank: {
		race: 0,
		name: '@!@',
		price: 400,
		type: UnitType.Heavy,

		baseStatistics: {
			AttackLight: 8,
			AttackHeavy: 10,
			AttackRange: 1,
			HealRate: 1,
			Defence: 8,
			Movement: 5,
			Visibility: 6,
		},
		
		actions: [
				  Actions.Classes.ActionMove,
				  Actions.Classes.ActionStay,
				  Actions.Classes.ActionAttack,
				  Actions.Classes.ActionHeal,
				 ],
		
		terrainStats: new function () {
			this[GameWorldTerrainType.Plains] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: -1, Defence: -2};
			this[GameWorldTerrainType.Rough] =		{ Cost: 3, Attack: -2, Defence: -3};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.HQ] =			{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Factory] =	{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: -1};
		},
	},

	Mech: {
		race: 0,
		name: '@!@',
		price: 400,
		type: UnitType.Heavy,

		baseStatistics: {
			AttackLight: 7,
			AttackHeavy: 8,
			AttackAerial: 8,
			AttackRange: 1,
			HealRate: 1,
			Defence: 8,
			Movement: 4,
			Visibility: 6,
		},
		
		actions: [
				  Actions.Classes.ActionMove,
				  Actions.Classes.ActionStay,
				  Actions.Classes.ActionAttack,
				  Actions.Classes.ActionHeal,
				 ],
		
		terrainStats: new function () {
			this[GameWorldTerrainType.Plains] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: 1, Defence: 1};
			this[GameWorldTerrainType.Mountain] =	{ Cost: 2, Attack: 1, Defence: 1};
			this[GameWorldTerrainType.Rough] =		{ Cost: 3, Attack: -2, Defence: -2};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.HQ] =			{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Factory] =	{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: -1};
		},
	},

	Sting: {
		race: 0,
		name: '@!@',
		price: 600,
		type: UnitType.Heavy,

		baseStatistics: {
			AttackLight: 6,
			AttackHeavy: 9,
			AttackAerial: 8,
			AttackRange: 5,
			HealRate: 1,
			Defence: 3,
			Movement: 5,
			Visibility: 6,
		},
		
		actions: [
				  Actions.Classes.ActionMove,
				  Actions.Classes.ActionStay,
				  Actions.Classes.ActionAttack,
				  Actions.Classes.ActionHeal,
				 ],
		
		terrainStats: new function () {
			this[GameWorldTerrainType.Plains] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: -2, Defence: -1};
			this[GameWorldTerrainType.Rough] =		{ Cost: 3, Attack: -2, Defence: -3};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.HQ] =			{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Factory] =	{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: 0};
		},

		AIHints: {
			guardsNeeded: 3,
		}
	},
};

UnitsDefinitions[Player.Races.Roaches] = {

	Nibbler: {
		race: 0,
		name: '@!@',
		price: 100,
		type: UnitType.Light,

		baseStatistics: {
			AttackLight: 6,
			AttackHeavy: 4,
			AttackRange: 1,
			HealRate: 1,
			Defence: 4,
			Movement: 3,
			Visibility: 4,
		},
		
		actions: [
				  Actions.Classes.ActionCapture,
				  Actions.Classes.ActionMove,
				  Actions.Classes.ActionStay,
				  Actions.Classes.ActionAttack,
				  Actions.Classes.ActionHeal,
				 ],
		
		terrainStats: new function () {
			this[GameWorldTerrainType.Plains] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: 0, Defence: 1};
			this[GameWorldTerrainType.Mountain] =	{ Cost: 3, Attack: 1, Defence: 2};
			this[GameWorldTerrainType.Rough] =		{ Cost: 3, Attack: -2, Defence: -2};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 1, Defence: 2};
			this[GameWorldTerrainType.HQ] =			{ Cost: 1, Attack: 1, Defence: 2};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 1, Attack: 1, Defence: 2};
			this[GameWorldTerrainType.Factory] =	{ Cost: 1, Attack: 1, Defence: 2};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 1, Defence: 0};
		},

		AIHints: {
			preferedMinCount: 3,
		},
	},

};

GenericUnits.push(UnitsDefinitions[Player.Races.Empire].PeaceKeeper);
GenericUnits.push(UnitsDefinitions[Player.Races.JunkPeople].FlakTrooper);
GenericUnits.push(UnitsDefinitions[Player.Races.Roaches].Nibbler);


(function () {
	
	// Add default values to the statistics
	for(var i = 0; i < UnitsDefinitions.length; ++i) {
		for(var key in UnitsDefinitions[i]) {
			var definition = UnitsDefinitions[i][key];
			definition.race = i;
			definition.name = key;
			definition.baseStatistics['MaxHealth'] = definition.baseStatistics['MaxHealth'] || 10;
			definition.baseStatistics['FirePower'] = definition.baseStatistics['FirePower'] || 4;
			definition.baseStatistics['AttackMultiplier'] = definition.baseStatistics['AttackMultiplier'] || 1;
			definition.AIHints = definition.AIHints || {};
		}
	}

}) ();