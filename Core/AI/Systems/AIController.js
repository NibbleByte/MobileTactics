//===============================================
// AIController
// The ai controller.
//===============================================
"use strict";

var AIController = function (m_world, m_executor) {
	var self = this;
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, onTurnChanged);

		self._eworldSB.subscribe(AIEvents.Simulation.SIMULATION_FINISHED, onSimulationFinished);
	};


	var onTurnChanged = function (event, gameState, hasJustLoaded) {

		if (gameState.currentPlayer != null 
			&& gameState.currentPlayer.isPlaying
			&& gameState.currentPlayer.type == Player.Types.AI
			) {
			self._eworld.trigger(AIEvents.Simulation.START_SIMULATION);
		}
	}
	
	var onSimulationFinished = function (event) {
		self._eworld.trigger(GameplayEvents.GameState.END_TURN);
	}
}

ECS.EntityManager.registerSystem('AIController', AIController);
SystemsUtils.supplySubscriber(AIController);