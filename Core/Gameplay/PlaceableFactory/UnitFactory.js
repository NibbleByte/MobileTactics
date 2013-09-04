//===============================================
// UnitFactory.js
// Factory for creating units.
//===============================================
"use strict";

//DEBUG: global Access
var lastCreated;

var UnitsFactory = {
	
	// TODO: Seal these objects too
	baseStatistics: {
		
		WarMiner: {
			Attack: 2,
			AttackRange: 2,
			MaxHealth: 20,
			Defence: 5,
			Movement: 2,
		},
		
		RhinoTank: {
			Attack: 4,
			AttackRange: 3,
			MaxHealth: 15,
			Defence: 4,
			Movement: 4,
		},
		
		TeslaTrooper: {
			Attack: 2,
			AttackRange: 1,
			MaxHealth: 10,
			Defence: 3,
			Movement: 3,
		},
	},
	
	createUnit: function () {
		
		var obj = new ECS.Entity();
		obj.addComponent(CTilePlaceable);
		obj.addComponent(CUnit);
		obj.addComponent(CActions);
		
		obj.addComponent(CStatistics);
		obj.addComponent(CEffects);
		
		//
		// Initialize
		//
		var ind = Math.floor(Math.random() * 3);
		switch (ind)
		{
		case 0: obj.CStatistics.resetStatistics(this.baseStatistics.WarMiner);
				obj.CUnit.name = 'WarMiner';
			break;
		case 1: obj.CStatistics.resetStatistics(this.baseStatistics.RhinoTank);
				obj.CUnit.name = 'RhinoTank';
			break;
		case 2: obj.CStatistics.resetStatistics(this.baseStatistics.TeslaTrooper);
				obj.CUnit.name = 'TeslaTrooper';
			break;
		};
		
		var effect = new Effect();
		effect.addStatisticModifier('Attack', 20);
		obj.CEffects.effects.push(effect);
		
		effect = new Effect();
		effect.addStatisticModifier('Attack', -30);
		effect.timeLeft = 2;
		obj.CEffects.effects.push(effect);
				
		obj.CActions.actions.push(ActionMove);
		obj.CActions.actions.push(ActionAttack);
		
		
		
		lastCreated = obj;
		
		return obj;
	},
};