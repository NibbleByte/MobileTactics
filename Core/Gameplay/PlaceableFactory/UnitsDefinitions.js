//===============================================
// UnitsDefinitions.js
// Factory for creating units.
//===============================================
"use strict";

var UnitsDefinitions = [];

UnitsDefinitions[Player.Races.Humans] = {

	// TODO: Seal these objects too
	WarMiner: {
		name: '@!@',
		price: 200,

		baseStatistics: {
			Attack: 2,
			AttackRange: 2,
			MaxHealth: 20,
			HealRate: 2,
			Defence: 5,
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
			this[GameWorldTerrainType.Dirt] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Mountain] =	{ Cost: 3, Attack: 0, Defence: 0};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: 0};
		},
	}, 
	
	RhinoTank: {
		name: '@!@',
		price: 500,

		baseStatistics: {
			Attack: 4,
			AttackRange: 3,
			MaxHealth: 15,
			Defence: 4,
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
			this[GameWorldTerrainType.Dirt] =		{ Cost: 2, Attack: 0, Defence: 0};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: 0};
		},
	},
	
	TeslaTrooper: {
		name: '@!@',
		price: 250,

		baseStatistics: {
			Attack: 2,
			AttackRange: 1,
			MaxHealth: 10,
			Defence: 3,
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
			this[GameWorldTerrainType.Grass] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Dirt] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Mountain] =	{ Cost: 2, Attack: 1, Defence: 0};

			this[GameWorldTerrainType.Base] =		{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Harbour] =	{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.Medical] =	{ Cost: 1, Attack: 0, Defence: 0};
			this[GameWorldTerrainType.WatchTower] = { Cost: 1, Attack: 0, Defence: 0};
		},
	},	
};


UnitsDefinitions[Player.Races.Roaches] = {
};

UnitsDefinitions[Player.Races.JunkBots] = {
};

(function () {
	
	for(var i = 0; i < UnitsDefinitions.length; ++i) {
		for(var key in UnitsDefinitions[i]) {
			UnitsDefinitions[i][key].name = key;
		}
	}

}) ();