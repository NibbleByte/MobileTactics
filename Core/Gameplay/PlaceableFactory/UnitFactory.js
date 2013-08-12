//===============================================
// UnitFactory.js
// Factory for creating units.
//===============================================
"use strict";

//DEBUG: global Access
var lastCreated;

var UnitsFactory = {
	
	// TODO: Seal these objects too
	statisticsGrunt: {
		Attack: 2,
		AttackRange: 2,
		MaxHealth: 10,
		Defence: 3,
		Movement: 3,
	},
	
	createGrunt: function (eworld) {
		
		var obj = eworld.createEntity();
		obj.addComponent(CTilePlaceable);
		obj.addComponent(CUnit);
		obj.addComponent(CActions);
		
		obj.addComponent(CStatistics);
		obj.addComponent(CEffects);
		
		obj.addComponent(CTilePlaceableRendering);
		obj.addComponent(CUnitRendering);
		
		//
		// Initialize
		//
		obj.CStatistics.resetStatistics(this.statisticsGrunt);
		
		var effect = new Effect();
		effect.addStatisticModifier('Attack', 20);
		obj.CEffects.effects.push(effect);
		
		effect = new Effect();
		effect.addStatisticModifier('Attack', -30);
		effect.timeLeft = 2;
		obj.CEffects.effects.push(effect);
				
		obj.CActions.actions.push(ActionMove);
		obj.CActions.actions.push(ActionAttack);
		
		var ind = Math.floor(Math.random() * 3);
		switch (ind)
		{
			case 0: obj.CTilePlaceableRendering.skin = 'WarMiner'; break;
			case 1: obj.CTilePlaceableRendering.skin = 'RhinoTank'; break;
			case 2: obj.CTilePlaceableRendering.skin = 'TeslaTrooper'; break;
		};
		
		lastCreated = obj;
		
		return obj;
	},
};