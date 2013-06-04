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
		MaxHealth: 10,
		Defence: 3,
	},
	
	createGrunt: function () {
		
		// Components
		var obj = new Entity();
		EntityManager.addComponents(obj, CTilePlaceable);
		EntityManager.addComponents(obj, CActionMove);
		EntityManager.addComponents(obj, CActionAttack);
		
		EntityManager.addComponents(obj, CUnit);
		EntityManager.addComponents(obj, CEffects);
		//EntityManager.addComponents(obj, CStatistics);
		
		
		// DEBUG: Initialize
		obj.baseStatistics(this.statisticsGrunt);
		
		var effect = new Effect();
		effect.addStatisticModifier('Attack', 20);
		obj.addEffect(effect);
		
		effect = new Effect();
		effect.addStatisticModifier('Attack', -30);
		effect.timeLeft = 2;
		obj.addEffect(effect);
		
		
		var ind = Math.floor(Math.random() * 3);
		switch (ind)
		{
			case 0: obj.skin('WarMiner'); break;
			case 1: obj.skin('RhinoTank'); break;
			case 2: obj.skin('TeslaTrooper'); break;
		};
		
		lastCreated = obj;
		
		return obj;
	},
};