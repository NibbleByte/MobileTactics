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
			Movement: 2,
		},
		
		actions: [
				  Actions.Classes.ActionMove,
				  Actions.Classes.ActionAttack,
				 ]
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
				 ]
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
				 ]
	},	
};