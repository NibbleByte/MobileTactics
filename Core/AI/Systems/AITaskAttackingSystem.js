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
		var enemies = m_gameState.visiblePlaceables[PlayersData.Relation.Enemy];
		var units = m_gameState.currentPlaceables;

		for(var i = 0; i < enemies.length; ++i) {
			var enemy = enemies[i];

			var task = new AITask(enemy, self, 10);

			for(var j = 0; j < units.length; ++j) {
				var priority = 30 / m_world.getDistance(enemy.CTilePlaceable.tile, units[j].CTilePlaceable.tile);
				var assignment = new AIAssignment(priority, 5, task, units[j]);
				assignments.push(assignment);
			}
		}
	}
	
	this.generateActionData = function (assignment) {
		var target = assignment.task.objective;
		var targetTile = target.CTilePlaceable.tile;
		var goActions = m_executor.getAvailableActions(assignment.taskDoer);
		
		if (!goActions)
			return null;
		
		var goTile = goActions.go.CTilePlaceable.tile;
		var hasAttacked = Actions.Classes.ActionAttack.hasExecutedAction(goActions.go);

		// Has not attacked, but target is already dead (killed by somebody else). Skip this assignment.
		if (!hasAttacked && !target.isAttached()) {
			return null;
		}


		var moveAction = goActions.getActionByType(Actions.Classes.ActionMove);
		var attackAction = goActions.getActionByType(Actions.Classes.ActionAttack);
		var stayAction = goActions.getActionByType(Actions.Classes.ActionStay);

		// NOTE: Unit can be destroyed (I probably killed it and have MovementAttack to execute.)
		var canAttack = target.isAttached() && attackAction && attackAction.availableTiles.contains(targetTile);

		// Move randomly.
		if (moveAction) {
			
			// Has attacked already, run away.
			if (hasAttacked) {
				if (target.isAttached()) {
					moveAction.appliedTile = MathUtils.randomElement(m_world.getFurthestTiles(targetTile, moveAction.availableTiles));
				} else {
					moveAction.appliedTile = MathUtils.randomElement(moveAction.availableTiles);
				}
				return new AIActionData(moveAction);
			}


			// Check if I'm already in a good position to attack.
			var attackRange = goActions.go.CStatistics.statistics['AttackRange'];
			var dist = m_world.getDistance(goTile, targetTile);
			if (canAttack && attackRange == dist) {
				attackAction.appliedTile = targetTile;
				return new AIActionData(attackAction);
			}

			// Check if can move in attack range directly.
			var attackTiles = m_world.getTilesInArea(targetTile, attackRange);

			for(var i = 0; i < attackTiles.length; ++i) {
				if (!moveAction.availableTiles.contains(attackTiles[i])) {
					attackTiles.removeAt(i);
					--i;
				}
			}



			if (attackTiles.length > 0) {
				var tile = MathUtils.randomElement(m_world.getFurthestTiles(targetTile, attackTiles));

				// NOTE: if no edge movements possible and still in attack range, attack directly.
				// Example: tank is in 2 out of 3 attack range, but can't move further away. Force attack to avoid worse movement.
				if (canAttack && m_world.getDistance(tile, targetTile) < dist) {
					attackAction.appliedTile = targetTile;
					return new AIActionData(attackAction);
				}

				moveAction.appliedTile = tile;
				return new AIActionData(moveAction);
			}

			

			// Move along path to the objective.
			var mdata = {
				placeable: goActions.go,
				player: goActions.go.CPlayerData.player,
				playersData: m_playersData
			};

			var path = m_world.findPath(goTile, targetTile, Actions.Classes.ActionMove.movementCostQuery, mdata);

			var moveTile = null;
			for(var i = path.length; i >= 0; --i) {
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


		if (canAttack) {
			attackAction.appliedTile = targetTile;
			return new AIActionData(attackAction);
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

ECS.EntityManager.registerSystem('AITaskAttackingSystem', AITaskAttackingSystem);
SystemsUtils.supplySubscriber(AITaskAttackingSystem);
