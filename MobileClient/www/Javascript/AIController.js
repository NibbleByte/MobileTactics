//===============================================
// AIController
// The ai controller.
//===============================================
"use strict";

var AIController = function (m_executor) {
	var self = this;
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADING, onGameLoading);
		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, onTurnChanged);

		self._eworldSB.subscribe(AIEvents.Simulation.SIMULATION_FINISHED, onSimulationFinished);
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


	var onTurnChanged = function (event) {

		if (m_gameState.currentPlayer != null 
			&& m_gameState.currentPlayer.isPlaying
			&& m_gameState.currentPlayer.type == Player.Types.AI
			) {

			var units = m_gameState.currentPlaceables;
			for(var i = 0; i < units.length; ++i) {
				units[i].addComponentSafe(CAIData).reset();
			}

			self._eworld.trigger(AIEvents.Simulation.START_SIMULATION);
		}
	}
	
	var m_replayAssignments = null;
	var m_replayIndex = 0;

	var onSimulationFinished = function (event, validAssignments) {
		m_replayAssignments = validAssignments;
		m_replayIndex = 0;

		processAssignments();
	}


	var processAssignments = function () {

		if (m_replayIndex < m_replayAssignments.length) {
			var assignment = m_replayAssignments[m_replayIndex];

			if (!Utils.assert(assignment.taskDoer && assignment.task)) {
				var action = assignment.task.creator.generateAction(assignment);

				if (!Utils.assert(action, 'Could not generate action -> bad assignment.'))
					m_executor.executeAction(action);
			}

			++m_replayIndex;
			setTimeout(processAssignments, 500);
		} else {
			self._eworld.trigger(GameplayEvents.GameState.END_TURN);
		}
	}
}

ECS.EntityManager.registerSystem('AIController', AIController);
SystemsUtils.supplySubscriber(AIController);