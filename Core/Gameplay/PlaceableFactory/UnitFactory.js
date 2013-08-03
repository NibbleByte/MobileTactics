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
		Movement: 3,
	},
	
	createGrunt: function (eworld) {
		
		var obj = eworld.createEntity();
		obj.addComponent(CTilePlaceable);
		obj.addComponent(CUnit);
		
		obj.addComponent(CTilePlaceableRendering);
		obj.addComponent(CUnitRendering);
		
		/*
		// Components
		var obj = new Entity();
		EntityManager.addComponents(obj, CTilePlaceable);
		EntityManager.addComponents(obj, CActionMove);
		EntityManager.addComponents(obj, CActionAttack);
		
		EntityManager.addComponents(obj, CUnit);
		
		// DEBUG: Initialize
		obj.baseStatistics(this.statisticsGrunt);
		
		var effect = new Effect();
		effect.addStatisticModifier('Attack', 20);
		obj.addEffect(effect);
		
		effect = new Effect();
		effect.addStatisticModifier('Attack', -30);
		effect.timeLeft = 2;
		obj.addEffect(effect);
		*/
		
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