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

		self._eworldSB.subscribe(AIEvents.Simulation.FORCE_START_SIMULATION, onTurnChanged);
		self._eworldSB.subscribe(AIEvents.Simulation.SIMULATION_FINISHED, onSimulationFinished);

		self._eworldSB.subscribe(ClientEvents.Controller.ACTION_EXECUTE, onActionExecute);
	};

	this.uninitialize = function () {
		clearTimeout(m_currentTimeout);

		m_replayAssignments = null;
		m_replayIndex = 0;
		m_selectedGOActions = null;
		m_actionData = null;
		m_currentTimeout = null;

		m_scheduleData.handler = null;
	}

	this.pause = function () {
		m_scheduleData.paused = true;

		clearTimeout(m_currentTimeout);
	}

	this.nextStep = function () {
		self.pause();

		m_scheduleData.handler();
	}

	this.resume = function () {
		if (!m_scheduleData.paused)
			return;

		m_scheduleData.paused = false;

		scheduleNextStep(m_scheduleData.handler, m_scheduleData.timeout);
	}

	//
	// Private
	//

	var m_gameState = null;
	var m_playersData = null;

	var onGameLoading = function () {
		m_gameState = self._eworld.extract(GameState);
		m_playersData = self._eworld.extract(PlayersData);
	}


	var onTurnChanged = function () {

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
	
	var m_replayTasks = null;
	var m_replayAssignments = null;
	var m_replayIndex = 0;
	var m_selectedGOActions = null;
	var m_actionData = null;
	var m_currentAssignment = null;
	var m_currentTimeout = null;

	this.SELECTION_TIMEOUT = 800;
	this.ACTION_TIMEOUT = 800;



	var m_scheduleData = {
		handler: null,
		timeout: 0,
		paused: false,
	}

	var scheduleNextStep = function (handler, timeout) {
		m_scheduleData.handler = handler;
		m_scheduleData.timeout = timeout;

		if (!m_scheduleData.paused) {
			m_currentTimeout = setTimeout(m_scheduleData.handler, m_scheduleData.timeout);
		}
	}

	var onSimulationFinished = function (tasks, assignments) {
		m_replayTasks = tasks;
		m_replayAssignments = assignments;
		m_replayIndex = 0;

		processAssignments();
	}


	var processAssignments = function () {

		m_scheduleData.handler = null;

		if (m_replayIndex < m_replayAssignments.length) {
			m_currentAssignment = m_replayAssignments[m_replayIndex];

			if (m_currentAssignment.canAssign() && m_currentAssignment.isValid()) {
				m_actionData = m_currentAssignment.task.creator.generateActionData(m_currentAssignment);

				if (m_actionData) {
					m_currentAssignment.assign();

					// Select the unit (visually). Only if this is unit.
					if (m_currentAssignment.taskDoer.CTilePlaceable) {
						m_selectedGOActions = m_executor.getAvailableActions(m_currentAssignment.taskDoer);

						if (m_currentAssignment.taskDoer.CTilePlaceable.tile.CTileRendering.viewerVisible) {
							self._eworld.trigger(ClientEvents.Controller.ACTIONS_OFFERED, m_selectedGOActions);
							self._eworld.trigger(ClientEvents.Controller.TILE_SELECTED, m_currentAssignment.taskDoer.CTilePlaceable.tile);
						} else {
							self._eworld.trigger(ClientEvents.Controller.TILE_SELECTED, null);
						}
					} else {
						// Assume taskDoer is tile
						if (m_currentAssignment.taskDoer.CTileRendering.viewerVisible) {
							self._eworld.trigger(ClientEvents.Controller.TILE_SELECTED, m_currentAssignment.taskDoer);
						} else {
							self._eworld.trigger(ClientEvents.Controller.TILE_SELECTED, null);
						}
					}

					self._eworld.trigger(AIEvents.Execution.CURRENT_ASSIGNMENT_CHANGED, m_currentAssignment);
					scheduleNextStep(processSelected, self.SELECTION_TIMEOUT);
				}

			}
			
			// If no selection was made, proceed to next one directly.
			if (m_scheduleData.handler != processSelected) {
				m_currentTimeout = setTimeout(processAssignments, 0);
			}

			++m_replayIndex;
		} else {

			m_currentAssignment = null;

			if (!self._eworld.blackboard[AIBlackBoard.Simulation.RESUME_NEEDED]) {
				self._eworld.trigger(GameplayEvents.GameState.END_TURN);
			} else {

				// Clear all previous tasks so units with more turns be available for use once again.
				// Plus add CAIData for newly created units.
				var units = m_gameState.currentPlaceables;
				for(var i = 0; i < units.length; ++i) {
					units[i].addComponentSafe(CAIData).reset();
				}

				self._eworld.trigger(AIEvents.Simulation.RESUME_SIMULATION, m_replayTasks);
			}
		}
	}

	var processSelected = function () {

		if (m_selectedGOActions) {
			if (m_selectedGOActions.go.CTilePlaceable.tile.CTileRendering.viewerVisible) {
				self._eworld.trigger(ClientEvents.Controller.ACTIONS_CLEARED);
				self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.Highlights);
			}
			m_selectedGOActions = null;
		}

		if (m_actionData.action && m_actionData.action.appliedTile && m_actionData.action.appliedTile.CTileRendering.viewerVisible) {
			self._eworld.trigger(ClientEvents.Controller.TILE_SELECTED, m_actionData.action.appliedTile);
			self._eworld.trigger(ClientEvents.Controller.ACTION_PREEXECUTE, m_actionData.action);
		} else {
			onActionExecute();
			self._eworld.trigger(ClientEvents.Controller.TILE_SELECTED, null);
		}
	}

	var onActionExecute = function () {

		if (m_gameState.currentPlayer.type != Player.Types.AI)
			return;

		// Use only one turn point (next unit turn point will be used in the next simulation iteration).
		var prevTurnpoints = (m_currentAssignment.taskDoer.CUnit) ? m_currentAssignment.taskDoer.CUnit.turnPoints : 1;

		m_currentAssignment.task.creator.executeAction(m_actionData);

		var currentTurnpoints = (m_currentAssignment.taskDoer.CUnit) ? m_currentAssignment.taskDoer.CUnit.turnPoints : 1;

		// Detect units with more turn points pending.
		if (prevTurnpoints != currentTurnpoints && currentTurnpoints > 0)
			self._eworld.blackboard[AIBlackBoard.Simulation.RESUME_NEEDED] = true;

		if (m_currentAssignment.isValid() && prevTurnpoints == currentTurnpoints) {
			// Check if there are more actions to execute...
			m_actionData = m_currentAssignment.task.creator.generateActionData(m_currentAssignment);
		} else {
			m_actionData = null;
		}

		if (!m_actionData) {
			scheduleNextStep(processAssignments, self.ACTION_TIMEOUT);
		} else {

			// Again: only for units.
			if (m_currentAssignment.taskDoer.CTilePlaceable) {
				m_selectedGOActions = m_executor.getAvailableActions(m_currentAssignment.taskDoer);

				if (m_currentAssignment.taskDoer.CTilePlaceable.tile.CTileRendering.viewerVisible) {
					self._eworld.trigger(ClientEvents.Controller.ACTIONS_OFFERED, m_selectedGOActions);
				}
			}

			scheduleNextStep(processSelected, self.SELECTION_TIMEOUT);
		}
	};
}

ECS.EntityManager.registerSystem('AIController', AIController);
SystemsUtils.supplySubscriber(AIController);