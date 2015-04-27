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

	var onGameLoading = function (event) {
		m_gameState = self._eworld.extract(GameState);
		m_playersData = self._eworld.extract(PlayersData);
	}
	
	var onGatherAssignments = function (event, assignments) {

		for(var i = 0; i < m_gameState.currentStructures.length; ++i) {
			var structure = m_gameState.currentStructures[i];

			var task = new AITask(structure, self, 1);
			var assignment = new AIAssignment(2, 1, task, structure);
			assignment.useAIData = false;

			assignments.push(assignment);
		}
	}
	
	this.generateActionData = function (assignment) {
		var target = assignment.task.objective;
		
		if (!Store.canPlayerShop(self._eworld, target)) {
			return null;	
		}

		// Return empty action. Will decide later what unit to build (based on how the turn got executed and what is needed).
		var actionData = new AIActionData(null);
		actionData.shopItem = MathUtils.randomElement(Store.getPriceListFromTile(self._eworld, target));
		return actionData;
	}

	this.executeAction = function (actionData) {

		if (Utils.assert(actionData.shopItem, 'Invalid action data?!'))
			return;

		actionData.action = Store.buyItem(actionData.shopItem);
	}
}

ECS.EntityManager.registerSystem('AITaskBuyingSystem', AITaskBuyingSystem);
SystemsUtils.supplySubscriber(AITaskBuyingSystem);
