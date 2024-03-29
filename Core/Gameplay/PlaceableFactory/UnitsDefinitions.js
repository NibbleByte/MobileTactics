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

var UnitCategory = {
	Infantry: 0,
	Fast: 0,
	Heavy: 0,
	Aerial: 0,
	Artillery: 0,
};
Enums.enumerate(UnitCategory);


var UnitsDefinitions = [];

UnitsDefinitions.AttackStatNamesByType = [];
UnitsDefinitions.AttackStatNamesByType[UnitType.Light] = 'AttackLight';
UnitsDefinitions.AttackStatNamesByType[UnitType.Heavy] = 'AttackHeavy';
UnitsDefinitions.AttackStatNamesByType[UnitType.Aerial] = 'AttackAerial';
UnitsDefinitions.AttackStatNamesByType[UnitType.Naval] = 'AttackNaval';

UnitsDefinitions.GenericUnits = [];	// Contains the definitions of all generic units (i.e. basic race unit that can be used in generic maps).

UnitsDefinitions.GenericUnits.getDefinitionByRace = function (race) {

	for(var i = 0; i < UnitsDefinitions.GenericUnits.length; ++i) {
		if (UnitsDefinitions.GenericUnits[i].race == race)
			return UnitsDefinitions.GenericUnits[i];
	}
}

UnitsDefinitions[Player.Races.Developers] = {

	WarMiner: {
		race: 0,
		name: '@!@',
		price: 200,
		type: UnitType.Heavy,
		category: UnitCategory.Heavy,

		strongVS: [],
		weakVS: [],

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
		category: UnitCategory.Heavy,

		strongVS: [],
		weakVS: [],

		bypassZoneOfControl: true,

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
		category: UnitCategory.Infantry,

		strongVS: [],
		weakVS: [],

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
		category: UnitCategory.Infantry,

		strongVS: [UnitCategory.Aerial, UnitCategory.Artillery],
		weakVS:	[],

		baseStatistics: {
			AttackLight: 5,
			AttackHeavy: 3,
			AttackAerial: 4,
			AttackRange: 1,
			HealRate: 1,
			Defence: 4,
			Movement: 9,	// 3 x Plains
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
			this[GameWorldTerrainType.Plains] =		{ Cost: 3, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 4, Attack: 1, Defence: 2};
			this[GameWorldTerrainType.Mountain] =	{ Cost: 6, Attack: 2, Defence: 5};
			this[GameWorldTerrainType.Rough] =		{ Cost: 5, Attack: -1, Defence: -1};

			this[GameWorldTerrainType.Base] =		{ Cost: 4, Attack: 1, Defence: 1};
			this[GameWorldTerrainType.HQ] =			{ Cost: 4, Attack: 1, Defence: 2};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 4, Attack: 1, Defence: 1};
			this[GameWorldTerrainType.Factory] =	{ Cost: 4, Attack: 1, Defence: 1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 3, Attack: 0, Defence: 0};
		},

		AIHints: {
			preferedMinCount: 2,
		},
	},
	
	Speeder: {
		race: 0,
		name: '@!@',
		price: 250,
		type: UnitType.Heavy,
		category: UnitCategory.Fast,

		strongVS: [UnitCategory.Infantry, UnitCategory.Artillery],
		weakVS: [],

		bypassZoneOfControl: true,

		baseStatistics: {
			AttackLight: 7,
			AttackHeavy: 4,
			AttackAerial: 3,
			AttackRange: 1,
			HealRate: 2,
			Defence: 4,
			Movement: 5,	// 5 x Plains
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
			this[GameWorldTerrainType.Plains] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: -1, Defence: -1};
			this[GameWorldTerrainType.Rough] =		{ Cost: 4, Attack: -2, Defence: -2};

			this[GameWorldTerrainType.Base] =		{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.HQ] =			{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Factory] =	{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: -1};
		},
	},

	HoverCannon: {
		race: 0,
		name: '@!@',
		price: 450,
		type: UnitType.Heavy,
		category: UnitCategory.Heavy,

		strongVS: [UnitCategory.Infantry, UnitCategory.Fast],
		weakVS: [],

		baseStatistics: {
			AttackLight: 7,
			AttackHeavy: 6,
			AttackRange: 2,
			HealRate: 1,
			Defence: 6,
			Movement: 3,	// 3 x Plains
			Visibility: 3,
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
			this[GameWorldTerrainType.Water] =		{ Cost: 1, Attack: -1, Defence: -2};

			this[GameWorldTerrainType.Base] =		{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.HQ] =			{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Factory] =	{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: 1};
		},
	},

	Comanche: {
		race: 0,
		name: '@!@',
		price: 500,
		type: UnitType.Aerial,
		category: UnitCategory.Aerial,

		strongVS: [UnitCategory.Fast, UnitCategory.Heavy],
		weakVS: [],

		baseStatistics: {
			AttackLight: 5,
			AttackHeavy: 7,
			AttackAerial: 5,
			AttackRange: 1,
			HealRate: 1,
			Defence: 4,
			Movement: 4,	// 4 x Plains
			Visibility: 5,
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

			this[GameWorldTerrainType.Base] =		{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.HQ] =			{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Factory] =	{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: 0};
		},
	},

	IonDrone: {
		race: 0,
		name: '@!@',
		price: 600,
		type: UnitType.Heavy,
		category: UnitCategory.Artillery,

		strongVS: [UnitCategory.Aerial, UnitCategory.Heavy],
		weakVS: [],

		disableMoveAttack: true,

		baseStatistics: {
			AttackLight: 7,
			AttackHeavy: 10,
			AttackAerial: 7,
			AttackRange: 6,
			AttackRangeMin: 2,
			HealRate: 1,
			Defence: 3,
			Movement: 6,	// 3 x Plains
			Visibility: 4,
		},
		
		actions: [
				  Actions.Classes.ActionMove,
				  Actions.Classes.ActionStay,
				  Actions.Classes.ActionAttack,
				  Actions.Classes.ActionHeal,
				 ],
		
		terrainStats: new function () {
			this[GameWorldTerrainType.Plains] =		{ Cost: 2, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 4, Attack: -1, Defence: 0};
			this[GameWorldTerrainType.Rough] =		{ Cost: 4, Attack: -2, Defence: -2};

			this[GameWorldTerrainType.Base] =		{ Cost: 4, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.HQ] =			{ Cost: 4, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 4, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Factory] =	{ Cost: 4, Attack: 0, Defence: -1};
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
		category: UnitCategory.Infantry,

		strongVS: [UnitCategory.Aerial, UnitCategory.Artillery],
		weakVS: [],

		baseStatistics: {
			AttackLight: 3,
			AttackHeavy: 3,
			AttackAerial: 4,
			AttackRange: 2,
			HealRate: 1,
			Defence: 3,
			Movement: 8,	// 2 x Plains
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
			this[GameWorldTerrainType.Plains] =		{ Cost: 3, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 4, Attack: 1, Defence: 2};
			this[GameWorldTerrainType.Mountain] =	{ Cost: 5, Attack: 2, Defence: 4};
			this[GameWorldTerrainType.Rough] =		{ Cost: 6, Attack: -1, Defence: -1};

			this[GameWorldTerrainType.Base] =		{ Cost: 3, Attack: 1, Defence: 1};
			this[GameWorldTerrainType.HQ] =			{ Cost: 3, Attack: 1, Defence: 2};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 3, Attack: 1, Defence: 1};
			this[GameWorldTerrainType.Factory] =	{ Cost: 3, Attack: 1, Defence: 1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: 0};
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
		category: UnitCategory.Fast,

		strongVS: [UnitCategory.Infantry, UnitCategory.Artillery],
		weakVS: [],

		baseStatistics: {
			FirePower: 3,
			AttackLight: 6,
			AttackHeavy: 4,
			AttackAerial: 3,
			AttackRange: 1,
			HealRate: 1,
			Defence: 4,
			Movement: 4,	// 4 x Plains
			Visibility: 4,
			
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
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: 1, Defence: 1};
			this[GameWorldTerrainType.Mountain] =	{ Cost: 2, Attack: 1, Defence: 1};
			this[GameWorldTerrainType.Rough] =		{ Cost: 3, Attack: -2, Defence: -2};

			this[GameWorldTerrainType.Base] =		{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.HQ] =			{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Factory] =	{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: -1};
		},
	},

	ScrapTank: {
		race: 0,
		name: '@!@',
		price: 450,
		type: UnitType.Heavy,
		category: UnitCategory.Heavy,

		strongVS: [UnitCategory.Infantry, UnitCategory.Fast],
		weakVS: [],

		baseStatistics: {
			AttackLight: 8,
			AttackHeavy: 8,
			AttackAerial: 3,
			AttackRange: 1,
			HealRate: 2,
			Defence: 7,
			Movement: 4,	// 4 x Plains
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
			this[GameWorldTerrainType.Forest] =		{ Cost: 3, Attack: -1, Defence: -2};
			this[GameWorldTerrainType.Rough] =		{ Cost: 3, Attack: -2, Defence: -3};

			this[GameWorldTerrainType.Base] =		{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.HQ] =			{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Factory] =	{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: -1};
		},
	},

	Bomberman: {
		race: 0,
		name: '@!@',
		price: 500,
		type: UnitType.Aerial,
		category: UnitCategory.Aerial,

		strongVS: [UnitCategory.Fast, UnitCategory.Heavy],
		weakVS: [],

		baseStatistics: {
			AttackLight: 3,
			AttackHeavy: 5,
			AttackAerial: 5,
			AttackRange: 2,
			HealRate: 1,
			Defence: 3,
			Movement: 4,	// 4 x Plains
			Visibility: 5,
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

			this[GameWorldTerrainType.Base] =		{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.HQ] =			{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Factory] =	{ Cost: 2, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: 0};
		},
	},

	Sting: {
		race: 0,
		name: '@!@',
		price: 600,
		type: UnitType.Heavy,
		category: UnitCategory.Artillery,

		strongVS: [UnitCategory.Aerial, UnitCategory.Heavy],
		weakVS: [],

		disableMoveAttack: true,

		baseStatistics: {
			AttackLight: 6,
			AttackHeavy: 9,
			AttackAerial: 7,
			AttackRange: 5,
			HealRate: 1,
			Defence: 3,
			Movement: 7,	// 2 x Plains
			Visibility: 4,
		},
		
		actions: [
				  Actions.Classes.ActionMove,
				  Actions.Classes.ActionStay,
				  Actions.Classes.ActionAttack,
				  Actions.Classes.ActionHeal,
				 ],
		
		terrainStats: new function () {
			this[GameWorldTerrainType.Plains] =		{ Cost: 3, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 4, Attack: -1, Defence: 0};
			this[GameWorldTerrainType.Rough] =		{ Cost: 6, Attack: -2, Defence: -2};

			this[GameWorldTerrainType.Base] =		{ Cost: 4, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.HQ] =			{ Cost: 4, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Minerals] =	{ Cost: 4, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Factory] =	{ Cost: 4, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: 0};
		},

		AIHints: {
			guardsNeeded: 3,
		}
	},
};

UnitsDefinitions.GenericUnits.push(UnitsDefinitions[Player.Races.Empire].PeaceKeeper);
UnitsDefinitions.GenericUnits.push(UnitsDefinitions[Player.Races.JunkPeople].FlakTrooper);


(function () {
	
	var definitions = [];

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

			definitions.push(definition);
		}
	}


	// Figure out strong/weak
	for(var i = 0; i < definitions.length; ++i) {

		var target = definitions[i];

		for(var race = 0; race < UnitsDefinitions.length; ++race) {
			for(var key in UnitsDefinitions[race]) {
				var definition = UnitsDefinitions[race][key];

				if (definition.strongVS.contains(target.category) && !target.weakVS.contains(definition.category)) {
					target.weakVS.push(definition.category);
				}
			}
		}

	}

}) ();