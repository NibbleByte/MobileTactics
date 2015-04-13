//===============================================
// AITaskAttackingSystem
// 
//===============================================
"use strict";

var AITaskAttackingSystem = function (m_world, m_executor) {
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
		var enemies = m_gameState.relationPlaceables[PlayersData.Relation.Enemy];
		var units = m_gameState.currentPlaceables;

		for(var i = 0; i < enemies.length; ++i) {

			if (!enemies[i].CTilePlaceable.tile.CTileVisibility.visible)
				continue;

			// TODO: If enemies are not enough, some units might not go attacking, because tasks are shared.
			var task = new AITask(1, enemies[i], self, 2);

			for(var j = 0; j < units.length; ++j) {
				var score = 30 / m_world.getDistance(enemies[i].CTilePlaceable.tile, units[j].CTilePlaceable.tile);
				var assignment = new AIAssignment(score, task, units[j]);
				assignments.push(assignment);
			}
		}
	}
	
	this.generateAction = function (assignment) {
		var goActions = m_executor.getAvailableActions(assignment.taskDoer);

		if (Utils.assert(goActions, 'No actions available?!'))
			return;

		var moveAction = goActions.getActionByType(Actions.Classes.ActionMove);
		var attackAction = goActions.getActionByType(Actions.Classes.ActionAttack);

		// Move randomly.
		if (moveAction) {
			moveAction.appliedTile = MathUtils.randomElement(moveAction.availableTiles);
			return moveAction;
		}
	}
}

ECS.EntityManager.registerSystem('AITaskAttackingSystem', AITaskAttackingSystem);
SystemsUtils.supplySubscriber(AITaskAttackingSystem);