//===============================================
// UnitsDefinitions.js
// Factory for creating units.
//===============================================
"use strict";

var UnitsDefinitions = [];

UnitsDefinitions[Player.Races.Developers] = {

	WarMiner: {
		race: 0,
		name: '@!@',
		price: 200,

		baseStatistics: {
			Attack: 6,
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
			this[GameWorldTerrainType.Grass] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Dirt] =		{ Cost: 1, Attack: 1, Defence: 0};
			this[GameWorldTerrainType.Mountain] =	{ Cost: 3, Attack: 0, Defence: 1};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: 0, Defence: 1};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: 0};
		},
	}, 
	
	RhinoTank: {
		race: 0,
		name: '@!@',
		price: 500,

		baseStatistics: {
			Attack: 10,
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
			this[GameWorldTerrainType.Grass] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Dirt] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: 0, Defence: -1};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: 0};
		},
	},
	
	TeslaTrooper: {
		race: 0,
		name: '@!@',
		price: 250,

		baseStatistics: {
			Attack: 6,
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
			this[GameWorldTerrainType.Grass] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Dirt] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: 0, Defence: 1};
			this[GameWorldTerrainType.Mountain] =	{ Cost: 2, Attack: 1, Defence: 1};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Harbour] =	{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.WatchTower] = { Cost: 1, Attack: 0, Defence: 0};
		},
	},
};


UnitsDefinitions[Player.Races.Humans] = {

	PeaceKeeper: {
		race: 0,
		name: '@!@',
		price: 100,

		baseStatistics: {
			Attack: 4,
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
			this[GameWorldTerrainType.Grass] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Dirt] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: 1, Defence: 2};
			this[GameWorldTerrainType.Mountain] =	{ Cost: 3, Attack: 2, Defence: 3};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 1, Defence: 2};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 1, Defence: 0};
		},
	},
	
	Ranger: {
		race: 0,
		name: '@!@',
		price: 250,

		baseStatistics: {
			Attack: 6,
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
			this[GameWorldTerrainType.Grass] =		{ Cost: 1, Attack: 1, Defence: 0};
			this[GameWorldTerrainType.Dirt] =		{ Cost: 1, Attack: 1, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: -1, Defence: -1};
			this[GameWorldTerrainType.Mountain] =	{ Cost: 3, Attack: -1, Defence: -2};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: -1};
		},
	},

	HoverCannon: {
		race: 0,
		name: '@!@',
		price: 450,

		baseStatistics: {
			Attack: 8,
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
			this[GameWorldTerrainType.Grass] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Dirt] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: -2, Defence: -1};
			this[GameWorldTerrainType.Water] =		{ Cost: 2, Attack: -1, Defence: -2};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: 1};
		},
	},

	Comanche: {
		race: 0,
		name: '@!@',
		price: 400,

		baseStatistics: {
			Attack: 8,
			AttackRange: 2,
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
			this[GameWorldTerrainType.Grass] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Dirt] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Mountain] =	{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Water] =		{ Cost: 1, Attack: 0, Defence: 0};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: 0};
		},
	},

	IonDrone: {
		race: 0,
		name: '@!@',
		price: 600,

		baseStatistics: {
			Attack: 10,
			AttackRange: 6,
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
			this[GameWorldTerrainType.Grass] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Dirt] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: -2, Defence: -1};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: 0};
		},
	},
};



UnitsDefinitions[Player.Races.JunkPeople] = {

	FlakTrooper: {
		race: 0,
		name: '@!@',
		price: 100,

		baseStatistics: {
			Attack: 4,
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
			this[GameWorldTerrainType.Grass] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Dirt] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: 0, Defence: 1};
			this[GameWorldTerrainType.Mountain] =	{ Cost: 3, Attack: 1, Defence: 2};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 1, Defence: 2};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 1, Defence: 0};
		},
	},

	Biker: {
		race: 0,
		name: '@!@',
		price: 200,

		baseStatistics: {
			Attack: 5,
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
			this[GameWorldTerrainType.Grass] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Dirt] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: 1, Defence: 0};
			this[GameWorldTerrainType.Mountain] =	{ Cost: 2, Attack: 1, Defence: 0};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: -1};
		},
	},

	ScrapTank: {
		race: 0,
		name: '@!@',
		price: 400,

		baseStatistics: {
			Attack: 10,
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
			this[GameWorldTerrainType.Grass] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Dirt] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: -1, Defence: -2};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: -1};
		},
	},

	Mech: {
		race: 0,
		name: '@!@',
		price: 400,

		baseStatistics: {
			Attack: 10,
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
			this[GameWorldTerrainType.Grass] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Dirt] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: 1, Defence: 1};
			this[GameWorldTerrainType.Mountain] =	{ Cost: 2, Attack: 1, Defence: 1};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: -1};
		},
	},

	Sting: {
		race: 0,
		name: '@!@',
		price: 600,

		baseStatistics: {
			Attack: 10,
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
			this[GameWorldTerrainType.Grass] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Dirt] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Forest] =		{ Cost: 2, Attack: -2, Defence: -1};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: -1};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: 0};
		},
	},
};

UnitsDefinitions[Player.Races.Roaches] = {
};

(function () {
	
	// Add default values to the statistics
	for(var i = 0; i < UnitsDefinitions.length; ++i) {
		for(var key in UnitsDefinitions[i]) {
			var definition = UnitsDefinitions[i][key];
			definition.race = i;
			definition.name = key;
			definition.baseStatistics['MaxHealth'] = definition.baseStatistics['MaxHealth'] || 10;
			definition.baseStatistics['FirePower'] = definition.baseStatistics['FirePower'] || 4;
		}
	}

}) ();