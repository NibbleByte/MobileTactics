//===============================================
// AIControllerUI
// The ai controller.
//===============================================
"use strict";

var AIControllerUI = function (m_executor, m_aiController) {
	var self = this;

	var m_$ToolbarContainer = $('#AIToolbarContainer').hide();

	var m_$BtnPause = $('#BtnAIPause');
	var m_$BtnNext = $('#BtnAINext');
	var m_$BtnResume = $('#BtnAIResume');
	var m_$BtnSlower = $('#BtnAISlower');
	var m_$BtnFaster = $('#BtnAIFaster');
	var m_$LbAssignmentDesc = $('#LbAIAssignmentDesc');

	var m_subscriber = null;
	
	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, onTurnChanged);

		self._eworldSB.subscribe(AIEvents.Simulation.SIMULATION_FINISHED, onSimulationFinished);
		self._eworldSB.subscribe(AIEvents.Execution.CURRENT_ASSIGNMENT_CHANGED, onAssignmentChanged);

		m_$ToolbarContainer.hide();

		m_subscriber = new DOMSubscriber();

		m_subscriber.subscribe(m_$BtnPause, 'click', onBtnPause);
		m_subscriber.subscribe(m_$BtnNext, 'click', onBtnNext);
		m_subscriber.subscribe(m_$BtnResume, 'click', onBtnResume);
		m_subscriber.subscribe(m_$BtnSlower, 'click', onBtnSlower);
		m_subscriber.subscribe(m_$BtnFaster, 'click', onBtnFaster);
	};

	this.uninitialize = function () {
		m_subscriber.unsubscribeAll();
		m_subscriber = null;
	}


	var onTurnChanged = function (event) {
		m_$ToolbarContainer.hide();
	}

	var onSimulationFinished = function (event, assignments) {
		m_$ToolbarContainer.show();
	}

	var onAssignmentChanged = function (event, assignment) {
		var priority = Math.round(assignment.priority);

		var creatorName = assignment.task.creator.getSystemName().replace('AITask', '').replace('System', '');

		var taskDoerName = '???';
		if (assignment.taskDoer.CUnit)
			taskDoerName = assignment.taskDoer.CUnit.name;
		if (assignment.taskDoer.CTileTerrain)
			taskDoerName = Enums.getName(GameWorldTerrainType, assignment.taskDoer.CTileTerrain.type);

		var objectiveName = '???';
		if (assignment.task.objective.CUnit)
			objectiveName = assignment.task.objective.CUnit.name;
		if (assignment.task.objective.CTileTerrain)
			objectiveName = Enums.getName(GameWorldTerrainType, assignment.task.objective.CTileTerrain.type);

		var score = assignment.score + '/' + assignment.task.scoreLimit;
		if (assignment.score == assignment.task.scoreAssigned)
			score += '!'; // Indicate that I'm doing this task alone!
			

		m_$LbAssignmentDesc.html(priority + ' - <u>' + creatorName + '</u>: <i>' + taskDoerName + ' > ' + objectiveName + '</i> (' + score + ')');
	}

	var onBtnPause = function (event) {
		m_aiController.pause();
	}

	var onBtnNext = function (event) {
		m_aiController.nextStep();
	}

	var onBtnResume = function (event) {
		m_aiController.resume();
	}

	var onBtnSlower = function (event) {
		m_aiController.SELECTION_TIMEOUT = Math.min(m_aiController.SELECTION_TIMEOUT * 2, 3200);
		m_aiController.ACTION_TIMEOUT = Math.min(m_aiController.ACTION_TIMEOUT * 2, 3200);
	}

	var onBtnFaster = function (event) {
		m_aiController.SELECTION_TIMEOUT = Math.max(m_aiController.SELECTION_TIMEOUT / 2, 200);
		m_aiController.ACTION_TIMEOUT = Math.max(m_aiController.ACTION_TIMEOUT / 2, 200);
	}
}

ECS.EntityManager.registerSystem('AIControllerUI', AIControllerUI);
SystemsUtils.supplySubscriber(AIControllerUI);