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
			var enemy = enemies[i];

			if (!enemy.CTilePlaceable.tile.CTileVisibility.visible)
				continue;

			// TODO: If enemies are not enough, some units might not go attacking, because tasks are shared.
			var task = new AITask(1, enemy, self, 2);

			for(var j = 0; j < units.length; ++j) {
				var score = 30 / m_world.getDistance(enemy.CTilePlaceable.tile, units[j].CTilePlaceable.tile);
				var assignment = new AIAssignment(score, task, units[j]);
				assignments.push(assignment);
			}
		}
	}
	
	this.generateAction = function (assignment) {
		var target = assignment.task.objective;
		var targetTile = target.CTilePlaceable.tile;
		var goActions = m_executor.getAvailableActions(assignment.taskDoer);
		

		if (!goActions)
			return null;

		var moveAction = goActions.getActionByType(Actions.Classes.ActionMove);
		var attackAction = goActions.getActionByType(Actions.Classes.ActionAttack);
		var stayAction = goActions.getActionByType(Actions.Classes.ActionStay);

		// NOTE: Unit can be destroyed (someone else killed it or have MovementAttack to execute.)
		if (target.isAttached() && attackAction && attackAction.availableTiles.contains(targetTile)) {
			attackAction.appliedTile = targetTile;
			return attackAction;
		}

		// Move randomly.
		if (moveAction) {
			
			// Has attacked already, run away.
			if (Actions.Classes.ActionAttack.hasExecutedAction(goActions.go)) {
				if (target.isAttached()) {
					moveAction.appliedTile = MathUtils.randomElement(m_world.getFurthestTiles(targetTile, moveAction.availableTiles));
				} else {
					moveAction.appliedTile = MathUtils.randomElement(moveAction.availableTiles);
				}
				return moveAction;
			}


			var mdata = {
				placeable: goActions.go,
				player: goActions.go.CPlayerData.player,
				playersData: m_playersData
			};

			var path = m_world.findPath(goActions.go.CTilePlaceable.tile, targetTile, Actions.Classes.ActionMove.movementCostQuery, mdata);

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
			return moveAction;
		}


		if (stayAction) {
			stayAction.appliedTile = goActions.go.CTilePlaceable.tile;
			return stayAction;
		}

		return null;
	}
}

ECS.EntityManager.registerSystem('AITaskAttackingSystem', AITaskAttackingSystem);
SystemsUtils.supplySubscriber(AITaskAttackingSystem);