//===============================================
// AITaskBuyingSystem
// 
//===============================================
"use strict";

var AITaskBuyingSystem = function (m_world, m_executor) {
	var self = this;
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADING, onGameLoading);
		self._eworldSB.subscribe(AIEvents.Simulation.GATHER_ASSIGNMENTS, onGatherAssignments);
	};


	//
	// Private
	//

	var m_gameState = null;
	var m_playersData = null;

	var onGameLoading = function () {
		m_gameState = self._eworld.extract(GameState);
		m_playersData = self._eworld.extract(PlayersData);
	}

	var ratingSorter = function (left, right) {
		return left.rating - right.rating;
	}


	var countUnitsByType = function (collection) {

		var unitCounts = {};

		for (var i = 0; i < collection.length; ++i) {
			var unitDefinition = collection[i].CUnit.getDefinition();
			var unitPath = UnitsFactory.generateDefinitionPath(unitDefinition.race, unitDefinition.name);

			if (unitCounts[unitPath] === undefined)
				unitCounts[unitPath] = { definition: unitDefinition, count: 0 };

			unitCounts[unitPath].count++;
		}

		return unitCounts;
	}
	

	var onGatherAssignments = function (tasks, assignments) {

		// TODO: AITaskBuyingSystem should be named Planning or Economic system or similar.
		
		var factories = m_gameState.currentStructuresTypes[GameWorldTerrainType.Factory];
		if (factories.length == 0)
			return;

		// Remove any previous such tasks, cause it is easier to create all from scrap.
		tasks.findRemoveAll(function (t) { return t.creator == self; });

		// Prepare some stats
		var enemyCounts = countUnitsByType(m_gameState.relationPlaceables[PlayersData.Relation.Enemy]);
		var alliesCounts = countUnitsByType(m_gameState.relationPlaceables[PlayersData.Relation.Ally]);
		var totalAlliesCount = m_gameState.relationPlaceables[PlayersData.Relation.Ally].length;

		var neutralStructuresCount = m_gameState.relationStructures[PlayersData.Relation.Neutral].length;
		var enemyStructuresCount = m_gameState.relationStructures[PlayersData.Relation.Enemy].length;


		// TODO: use the gameState to check if there are excluded units for this map/game.
		var buildableDefinitions = UnitsDefinitions[m_gameState.currentPlayer.race];
		var consideredDefinitions = {};
		var consideredList = [];



		//
		// Make unit ratings
		//
		for(var unitName in buildableDefinitions) {
			var definition = buildableDefinitions[unitName];
			var path = UnitsFactory.generateDefinitionPath(definition.race, definition.name);

			var unitsCount = (alliesCounts[path]) ? alliesCounts[path].count : 0;

			if (consideredDefinitions[path] === undefined) {
				consideredDefinitions[path] = { definition: definition, rating: 0, price: definition.price };
				consideredList.push(consideredDefinitions[path]);
			}

			var rating = 0;


			// Rate according to with current enemies
			for (var enemyPath in enemyCounts) {
				var enemyDefinition = enemyCounts[enemyPath].definition;
				var count = enemyCounts[enemyPath].count;

				var attack = definition.baseStatistics[UnitTypeStatNames[enemyDefinition.type]];
				if (attack === undefined)
					continue;

				rating += attack * count;
			}


			// Boosts
			rating += definition.baseStatistics['Movement'];
			if (definition.actions.contains(Actions.Classes.ActionCapture)) rating += neutralStructuresCount * 2 + enemyStructuresCount;
			if (unitsCount < definition.AIHints.preferedMinCount) rating += definition.AIHints.preferedMinCount - unitsCount / 2;



			// Penalties
			if (definition.disableMoveAttack) rating -= 5;
			if (totalAlliesCount < definition.AIHints.guardsNeeded) rating /= 2;


			consideredDefinitions[path].rating = rating;
		}


		consideredList.sort(ratingSorter);


		
		console.log('------------- Considered -------------------');
		for(var i = 0; i < consideredList.length; ++i) {
			var unitRating = consideredList[i];
			console.log(i, unitRating.definition.name, unitRating.rating.toFixed(2), unitRating.price);
		}


		//
		// Buy biggest possible.
		//
		var budget = m_gameState.currentPlayer.credits;
		var bestRating = consideredList.last();
		var purchaseList = [];
		for (var buyIndex = consideredList.length - 1; buyIndex >= 0; buyIndex--) {
			var consideredRating = consideredList[buyIndex];

			// Don't buy cheap useless stuff. Save money for bigger and better.
			if (bestRating.rating / consideredRating.rating > 2)
				continue;

			while(consideredRating.price <= budget) {
				budget -= consideredRating.price;
				purchaseList.push(consideredRating.definition);
			}
		}



		//
		// Select factories
		//
		var factoryRatings = [];
		var enemies = m_gameState.relationPlaceables[PlayersData.Relation.Enemy];
		var allies = m_gameState.relationPlaceables[PlayersData.Relation.Ally];
		for(var i = 0; i < factories.length; ++i) {
			var factory = factories[i];

			var enemyRating = 0;
			enemies.forEach(function (placeable) {
				enemyRating += 4 / m_world.getDistance(factory, placeable.CTilePlaceable.tile);
			});


			var alliesRating = 0;
			allies.forEach(function (placeable) {
				alliesRating += 1 / m_world.getDistance(factory, placeable.CTilePlaceable.tile);
			});

			var rating = enemyRating - alliesRating;

			factoryRatings.push({ factory: factory, rating: rating });
		}

		factoryRatings.sort(ratingSorter);


		//
		// Make purchases
		//
		var factoryIndex = factoryRatings.length - 1;
		for (var i = 0; i < purchaseList.length; ++i) {

			var task = new AITask(purchaseList[i], self, 1);
			tasks.push(task);

			// TODO: Choose better factories.
			var assignment = new AIAssignment(2, 1, task, factoryRatings[factoryIndex].factory);
			assignment.useAIData = false;

			assignments.push(assignment);

			factoryIndex--;
			if (factoryIndex < 0) factoryIndex += factoryRatings.length;
		}
	}
	
	this.generateActionData = function (assignment) {
		var target = assignment.taskDoer;
		var definition = assignment.task.objective;
		
		if (!Store.canPlayerShop(self._eworld, target)) {
			return null;	
		}

		var priceList = Store.getPriceListFromTile(self._eworld, target);
		var shopItem = priceList.find(function (item) { return item.definition == definition; });
		if (Utils.assert(shopItem, 'AI Trying to purchase item that is not available.')) {
			return null;
		}


		// Return empty action. Will decide later what unit to build (based on how the turn got executed and what is needed).
		var actionData = new AIActionData(null);
		actionData.shopItem = shopItem;
		return actionData;
	}

	this.executeAction = function (actionData) {

		if (Utils.assert(actionData.shopItem, 'Invalid action data?!'))
			return;

		actionData.action = Store.buyItem(actionData.shopItem);

		self._eworld.blackboard[AIBlackBoard.Simulation.RESUME_NEEDED] = true;
	}
}

ECS.EntityManager.registerSystem('AITaskBuyingSystem', AITaskBuyingSystem);
SystemsUtils.supplySubscriber(AITaskBuyingSystem);
