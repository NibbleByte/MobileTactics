//===============================================
// AITaskHealSystem
// 
//===============================================
"use strict";

var AITaskHealSystem = function (m_world, m_executor) {
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
	
	var onGatherAssignments = function (tasks, assignments) {

		// Remove any previous such tasks, cause it is easier to create all from scrap.
		tasks.findRemoveAll(function (t) { return t.creator == self; });

		for (var i = 0; i < m_gameState.currentPlaceables.length; ++i) {
			var unit = m_gameState.currentPlaceables[i];

			var maxHealth = unit.CStatistics.statistics['MaxHealth'];

			// Full health is very likely to happen.
			if (unit.CUnit.health == maxHealth || unit.CUnit.finishedTurn)
				continue;

			var priority = AIAssignment.BASE_TOP_PRIORITY;
			priority *= (maxHealth - unit.CUnit.health) / maxHealth;

			var task = new AITask(unit, self, 1);
			tasks.push(task);

			var assignment = new AIAssignment(priority, 1, task, unit);
			assignments.push(assignment);
		}
	}
	
	this.generateActionData = function (assignment) {
		var target = assignment.taskDoer;	// Self
		var targetTile = target.CTilePlaceable.tile;

		var goActions = m_executor.getAvailableActions(assignment.taskDoer);

		if (!goActions)
			return null;

		var healAction = goActions.getActionByType(Actions.Classes.ActionHeal);

		if (healAction) {
			healAction.appliedAction = targetTile;
			return new AIActionData(healAction);
		}

		return null;
	}

	this.executeAction = function (actionData) {

		if (Utils.assert(actionData.action, 'No action data?!'))
			return;

		m_executor.executeAction(actionData.action);
	}
}

ECS.EntityManager.registerSystem('AITaskHealSystem', AITaskHealSystem);
SystemsUtils.supplySubscriber(AITaskHealSystem);
