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

	this.uninitialize = function () {
		clearTimeout(m_currentTimeout);

		m_replayAssignments = null;
		m_replayIndex = 0;
		m_selectedGOActions = null;
		m_replayAction = null;
		m_currentTimeout = null;
	}

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
	var m_selectedGOActions = null;
	var m_replayAction = null;
	var m_currentAssignment = null;
	var m_currentTimeout = null;

	var SELECTION_TIMEOUT = 750;
	var ACTION_TIMEOUT = 750;

	var onSimulationFinished = function (event, assignments) {
		m_replayAssignments = assignments;
		m_replayIndex = 0;

		processAssignments();
	}


	var processAssignments = function () {

		m_currentTimeout = null;

		if (m_replayIndex < m_replayAssignments.length) {
			m_currentAssignment = m_replayAssignments[m_replayIndex];

			if (m_currentAssignment.canAssign() && m_currentAssignment.isValid()) {
				m_replayAction = m_currentAssignment.task.creator.generateAction(m_currentAssignment);

				if (m_replayAction) {
					m_currentAssignment.assign();

					// Select the unit (visually).
					m_selectedGOActions = m_executor.getAvailableActions(m_currentAssignment.taskDoer);
					GameExecutor.iterateOverActionTiles(m_selectedGOActions.actions, ActionsRender.highlightTileAction);
					self._eworld.trigger(ClientEvents.Controller.TILE_SELECTED, m_currentAssignment.taskDoer.CTilePlaceable.tile);

					m_currentTimeout = setTimeout(processSelected, SELECTION_TIMEOUT);
				}

			}
			
			// If no selection was made, proceed to next one directly.
			if (m_currentTimeout === null) {
				m_currentTimeout = setTimeout(processAssignments, 0);
			}

			++m_replayIndex;
		} else {

			m_currentAssignment = null;
			self._eworld.trigger(GameplayEvents.GameState.END_TURN);
		}
	}

	var processSelected = function () {

		GameExecutor.iterateOverActionTiles(m_selectedGOActions.actions, ActionsRender.unHighlightTile);
		m_selectedGOActions = null;

		self._eworld.trigger(ClientEvents.Controller.TILE_SELECTED, m_replayAction.appliedTile);


		m_executor.executeAction(m_replayAction);


		if (m_currentAssignment.isValid()) {
			// Check if there are more actions to execute...
			m_replayAction = m_currentAssignment.task.creator.generateAction(m_currentAssignment);
		} else {
			m_replayAction = null;
		}

		if (!m_replayAction) {
			m_currentTimeout = setTimeout(processAssignments, ACTION_TIMEOUT);
		} else {

			m_selectedGOActions = m_executor.getAvailableActions(m_currentAssignment.taskDoer);
			GameExecutor.iterateOverActionTiles(m_selectedGOActions.actions, ActionsRender.highlightTileAction);

			m_currentTimeout = setTimeout(processSelected, SELECTION_TIMEOUT);
		}
	}
}

ECS.EntityManager.registerSystem('AIController', AIController);
SystemsUtils.supplySubscriber(AIController);