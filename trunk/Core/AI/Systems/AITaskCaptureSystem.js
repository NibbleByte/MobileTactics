//===============================================
// AITaskCaptureSystem
// 
//===============================================
"use strict";

var AITaskCaptureSystem = function (m_world, m_executor) {
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
		var enemyStructures = m_gameState.knownStructures[PlayersData.Relation.Enemy];
		var neutralStructures = m_gameState.knownStructures[PlayersData.Relation.Neutral];
		var targetStructures = neutralStructures.concat(enemyStructures);
		var units = m_gameState.currentPlaceables;

		for(var i = 0; i < targetStructures.length; ++i) {
			var structure = targetStructures[i];

			var task = new AITask(structure, self, 15);

			for(var j = 0; j < units.length; ++j) {
				var unit = units[j];

				if (CTileOwner.isCapturing(unit))
					continue;
				if (!unit.CActions.actions.contains(Actions.Classes.ActionCapture))
					continue;

				var dist = m_world.getDistance(structure, unit.CTilePlaceable.tile);

				// If near target but occupied.
				var occupiedPenalty = 1;
				if (dist > 0 && dist <= 2 && structure.CTile.placedObjects.length > 0)
					occupiedPenalty = 2;

				var priority = AIAssignment.BASE_TOP_PRIORITY;

				// Graph formula: sin(x / 10 + PI / 2)
				// Gives from 1 to 0 for distance 1 to 16. Don't fall below 0.2.
				priority *= Math.max(Math.sin(dist / 10 + Math.PI / 2), 0.2);
				priority /= occupiedPenalty;
				var assignment = new AIAssignment(priority, unit.CUnit.health, task, unit);
				assignments.push(assignment);
			}
		}
	}
	
	this.generateActionData = function (assignment) {
		var targetTile = assignment.task.objective;

		var goActions = m_executor.getAvailableActions(assignment.taskDoer);

		if (!goActions)
			return null;

		var goTile = goActions.go.CTilePlaceable.tile;

		var moveAction = goActions.getActionByType(Actions.Classes.ActionMove);
		var attackAction = goActions.getActionByType(Actions.Classes.ActionAttack);
		var captureAction = goActions.getActionByType(Actions.Classes.ActionCapture);
		var stayAction = goActions.getActionByType(Actions.Classes.ActionStay);


		if (goTile == targetTile) {

			if (!captureAction)
				return null;

			captureAction.appliedTile = targetTile;
			return new AIActionData(captureAction);
		}

		// If someone occupies the structure, and doesn't move, attack him!
		var hasMoved = Actions.Classes.ActionMove.hasExecutedAction(goActions.go);
		if (attackAction && attackAction.availableTiles.contains(targetTile) && !hasMoved) {
			attackAction.appliedTile = targetTile;
			return new AIActionData(attackAction);
		}

		if (moveAction) {

			// Move along path to the objective.
			var mdata = {
				placeable: goActions.go,
				player: goActions.go.CPlayerData.player,
				playersData: m_playersData
			};

			var path = m_world.findPath(goTile, targetTile, Actions.Classes.ActionMove.movementCostQuery, mdata);

			var moveTile = null;
			for (var i = path.length; i >= 0; --i) {
				if (moveAction.availableTiles.contains(path[i])) {
					moveTile = path[i];
					break;
				}
			}


			if (Utils.assert(moveTile, 'No movement available?!'))
				return null;

			moveAction.appliedTile = moveTile;
			return new AIActionData(moveAction);

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

ECS.EntityManager.registerSystem('AITaskCaptureSystem', AITaskCaptureSystem);
SystemsUtils.supplySubscriber(AITaskCaptureSystem);
