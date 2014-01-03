//===============================================
// UnitsDefinitions.js
// Factory for creating units.
//===============================================
"use strict";

var UnitsDefinitions = {
	
	// TODO: Seal these objects too
	WarMiner: {
		baseStatistics: {
			Attack: 2,
			AttackRange: 2,
			MaxHealth: 20,
			Defence: 5,
			Movement: 3,
		},
		
		actions: [
				  Actions.Classes.ActionMove,
				  Actions.Classes.ActionAttack,
				 ],
		
		terrainCost: new function () {
			this[GameWorldTerrainType.Grass] = 1;
			this[GameWorldTerrainType.Dirt] = 1;
			this[GameWorldTerrainType.Mountain] = 3;
		},
	}, 
	
	RhinoTank: {
		baseStatistics: {
			Attack: 4,
			AttackRange: 3,
			MaxHealth: 15,
			Defence: 4,
			Movement: 4,
		},
		
		actions: [
				  Actions.Classes.ActionMove,
				  Actions.Classes.ActionAttack,
				 ],
		
		terrainCost: new function () {
			this[GameWorldTerrainType.Grass] = 1;
			this[GameWorldTerrainType.Dirt] = 2;
		},
	},
	
	TeslaTrooper: {
		baseStatistics: {
			Attack: 2,
			AttackRange: 1,
			MaxHealth: 10,
			Defence: 3,
			Movement: 3,
		},
		
		actions: [
				  Actions.Classes.ActionMove,
				  Actions.Classes.ActionAttack,
				 ],
		
		terrainCost: new function () {
			this[GameWorldTerrainType.Grass] = 1;
			this[GameWorldTerrainType.Dirt] = 1;
			this[GameWorldTerrainType.Mountain] = 2;
		},
	},	
};