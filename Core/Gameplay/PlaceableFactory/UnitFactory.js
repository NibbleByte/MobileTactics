//===============================================
// UnitFactory.js
// Factory for creating units.
//===============================================
"use strict";

//DEBUG: global Access
var lastCreated;

var UnitsFactory = new function () {
	var self = this;
	
	this.Events = {
		UNIT_CREATED: 		"unitsfactory.unit_created",		// event, unit
		UNIT_DESERIALIZED: 	"unitsfactory.unit_deserialized",	// event, unit
	};

	// Resolves string path to unit definition.
	this.resolveDefinitionPath = function (definitionPath) {
		var splits = definitionPath.split(':');
		console.assert(splits.length == 2);

		return UnitsDefinitions[Player.Races[splits[0].trim()]][splits[1].trim()];
	}

	// Resolves string path to race.
	this.resolveDefinitionPathRace = function (definitionPath) {
		var splits = definitionPath.split(':');
		console.assert(splits.length == 2);

		return Player.Races[splits[0].trim()];
	}

	// Pass on race and definition or just definition, to generate definition path
	// Can also pass the name of the unit.
	this.generateDefinitionPath = function (race, definition) {
		
		// Name of the definition
		if (!definition && Utils.isString(race)) {
			var name = race;
			for(var i = 0; i < UnitsDefinitions.length; ++i) {
				if (UnitsDefinitions[i][name]) {
					break;
				}
			}
			race = i;
			definition = UnitsDefinitions[race][name];
		}

		if (!definition) {
			definition = race;
			for(var i = 0; i < UnitsDefinitions.length; ++i) {
				if (UnitsDefinitions[i][definition.name] == definition) {
					break;
				}
			}
			race = i;
		}
		
		console.assert(Enums.isValidValue(Player.Races, race));

		return Enums.getName(Player.Races, race) + ':' + (Utils.isString(definition) ? definition : definition.name);
	}
	
	this.createUnit = function (definition, player) {
		
		var obj = new ECS.Entity();
		obj.addComponent(CTilePlaceable);
		obj.addComponent(CUnit);
		obj.addComponent(CActions);
		obj.addComponent(CPlayerData);
		
		obj.addComponent(CEffects);
		
		obj.CActions.actions = definition.actions;
		obj.CPlayerData.player = player;
		obj.CUnit.race = definition.race;
		obj.CUnit.name = definition.name;
		obj.CUnit.turnPoints = definition.baseStatistics['TurnPoints'] || 1;
		obj.CUnit.health = definition.baseStatistics['MaxHealth'];

		applyStatistics(obj);

		lastCreated = obj;
		
		self.trigger(self.Events.UNIT_CREATED, obj);
		
		return obj;
	};
	
	// Checks if this is unit and applies post deserialization stuff
	this.postDeserialize = function (entity) {
		if (!entity.hasComponents(CUnit))
			return;
		
		applyStatistics(entity);

		self.trigger(self.Events.UNIT_DESERIALIZED, entity);
	}

	var applyStatistics = function (placeable) {
		placeable.addComponent(CStatistics);

		var definition = UnitsDefinitions[placeable.CUnit.race][placeable.CUnit.name];

		placeable.CStatistics.baseStatistics = definition.baseStatistics;
		placeable.CStatistics.terrainStats = definition.terrainStats;
		placeable.CStatistics.resetStatistics();
	}
	
	Subscriber.makeSubscribable(this);
};
