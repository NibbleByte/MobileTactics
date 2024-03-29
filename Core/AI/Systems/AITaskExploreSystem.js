//===============================================
// AITaskExploreSystem
// 
//===============================================
"use strict";

var AITaskExploreSystem = function (m_world, m_executor) {
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

		var units = m_gameState.currentPlaceables;
		var enemyStructures = m_gameState.knownStructures[PlayersData.Relation.Enemy];
		var neutralStructures = m_gameState.knownStructures[PlayersData.Relation.Neutral];
		var targetTiles = neutralStructures.concat(enemyStructures);

		targetTiles = targetTiles.filter(filterNotVisibleTiles);

		// If too little or no structures found, add all non-seen tiles. Find those bastards!
		if (targetTiles.length <= 2) {
			targetTiles = targetTiles.concat(m_world.filterTiles(filterNotVisibleTiles));
		}

		// AI sees the whole world?
		if (targetTiles.length == 0)
			return;

		for(var i = 0; i < units.length; ++i) {
			var unit = units[i];

			if (unit.CUnit.finishedTurn)
				continue;

			var task = new AITask(MathUtils.randomElement(targetTiles), self, 1);
			tasks.push(task);

			// Low priority, exploring is like fallback when there is nothing else to do.
			var priority = AIAssignment.BASE_TOP_PRIORITY * 0.05;
			var assignment = new AIAssignment(priority, 1, task, unit);
			assignments.push(assignment);
		}
	}

	var filterNotVisibleTiles = function (tile) {
		return !tile.CTileVisibility.visible;
	}
	
	this.generateActionData = function (assignment) {
		var targetTile = assignment.task.objective;

		var goActions = m_executor.getAvailableActions(assignment.taskDoer);

		if (!goActions)
			return null;

		var goTile = goActions.go.CTilePlaceable.tile;

		var moveAction = goActions.getActionByType(Actions.Classes.ActionMove);
		var stayAction = goActions.getActionByType(Actions.Classes.ActionStay);

		if (moveAction) {

			var moveTile = AIUtils.pickTileTowards(targetTile, goActions, m_world, m_playersData);

			if (moveTile) {
				moveAction.appliedTile = moveTile;
				return new AIActionData(moveAction);
			} else {
				return null;
			}
		}

		if (stayAction) {
			stayAction.appliedTile = goTile;
			return new AIActionData(stayAction);
		}
		
		return null;
	}

	this.executeAction = function (actionData) {

		if (Utils.assert(actionData.action, 'No action data?!'))
			return;

		m_executor.executeAction(actionData.action);
	}
}

ECS.EntityManager.registerSystem('AITaskExploreSystem', AITaskExploreSystem);
SystemsUtils.supplySubscriber(AITaskExploreSystem);
