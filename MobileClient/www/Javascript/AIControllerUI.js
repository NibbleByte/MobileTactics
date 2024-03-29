//===============================================
// AIControllerUI
// The ai controller.
//===============================================
"use strict";

var AIControllerUI = function (m_executor, m_aiController) {
	var self = this;

	var m_$ToolbarContainer = $('#AIToolbar').hide();
	var m_$ToolbarDebug = $('#AIToolbarDebug').hide();
	var m_$LbAIName = $('#LbAIName');

	var m_$BtnPause = $('#BtnAIPause');
	var m_$BtnNext = $('#BtnAINext');
	var m_$BtnResume = $('#BtnAIResume');
	var m_$BtnSlower = $('#BtnAISlower');
	var m_$BtnFaster = $('#BtnAIFaster');
	var m_$LbAssignmentDesc = $('#LbAIAssignmentDesc');
	var m_$creditsLabel = $('#LbAICredits');

	var m_subscriber = null;
	
	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._eworldSB.subscribe(GameplayEvents.Resources.CURRENT_CREDITS_CHANGED, onCreditsChanged);

		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, onTurnChanged);
		self._eworldSB.subscribe(GameplayEvents.GameState.NO_PLAYING_PLAYERS, onTurnChanged);

		self._eworldSB.subscribe(ClientEvents.UI.STATE_CHANGED, onStateChanged);

		if (AIUtils.Debug) {
			self._eworldSB.subscribe(AIEvents.Execution.CURRENT_ASSIGNMENT_CHANGED, onAssignmentChanged);
			//self._eworldSB.subscribe(AIEvents.Execution.CURRENT_ASSIGNMENT_CHANGED, onAssignmentChangedToolbar);
		}

		m_$ToolbarContainer.hide();

		if (AIUtils.Debug)
			m_$ToolbarDebug.show()
		else
			m_$ToolbarDebug.hide();

		m_subscriber = new DOMSubscriber();

		m_subscriber.subscribe(m_$BtnPause, 'click', onBtnPause);
		m_subscriber.subscribe(m_$BtnNext, 'click', onBtnNext);
		m_subscriber.subscribe(m_$BtnResume, 'click', onBtnResume);
		m_subscriber.subscribe(m_$BtnSlower, 'click', onBtnSlower);
		m_subscriber.subscribe(m_$BtnFaster, 'click', onBtnFaster);

		m_$creditsLabel.text('-');
	};

	this.uninitialize = function () {
		hide();

		m_subscriber.unsubscribeAll();
		m_subscriber = null;
	}


	var show = function () {
		m_$ToolbarContainer.show();
	}

	var hide = function () {
		m_$ToolbarContainer.hide();
	}

	var onStateChanged = function (state) {

		if (state != GameUISystem.States.AI) {
			hide();
		} else {
			show();
		}
	}


	var onCreditsChanged = function (value, delta) {
		m_$creditsLabel.text(value);
	}

	var onTurnChanged = function () {
		var player = self._eworld.extract(GameState).currentPlayer;

		if (player) {
			m_$LbAIName.text(player.name);
		} else {
			m_$LbAIName.text('N/a');
		}
	}

	var FLOAT_TEXT_OFFSET = { x: 0, y: -12 };
	var onAssignmentChanged = function (assignment) {
		var priority = Math.round(assignment.priority);

		var creatorName = assignment.task.creator.getSystemName().replace('AITask', '').replace('System', '');

		var tileSource = assignment.taskDoer;
		if (assignment.taskDoer.CUnit)
			tileSource = assignment.taskDoer.CTilePlaceable.tile;

		var tileTarget = null;
		if (assignment.task.objective.CUnit)
			tileTarget = assignment.task.objective.CTilePlaceable.tile;
		if (assignment.task.objective.CTileTerrain)
			tileTarget = assignment.task.objective;


		var score = assignment.score + '/' + assignment.task.scoreLimit;
		if (assignment.score == assignment.task.scoreAssigned)
			score += '!'; // Indicate that I'm doing this task alone!


		self._eworld.trigger(RenderEvents.OverlayEffects.FLOAT_TEXT_TILE, tileSource, creatorName + '\n' + priority,
			{ offset: FLOAT_TEXT_OFFSET, intent: RenderIntents.Neutral }
		);

		if (tileTarget) {
			self._eworld.trigger(RenderEvents.OverlayEffects.FLOAT_TEXT_TILE, tileTarget, 'Here\n' + score,
				{ offset: FLOAT_TEXT_OFFSET, intent: RenderIntents.Negative }
			);
		}
	}

	var onAssignmentChangedToolbar = function (assignment) {
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
		if (assignment.task.objective.name)
			objectiveName = assignment.task.objective.name;
		if (assignment.task.objective.CTileTerrain) {
			var tile = assignment.task.objective;
			objectiveName = Enums.getName(GameWorldTerrainType, tile.CTileTerrain.type) + '{' + tile.CTile.row + ',' + tile.CTile.column +'}';
		}

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