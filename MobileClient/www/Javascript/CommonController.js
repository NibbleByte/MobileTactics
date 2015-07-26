//===============================================
// CommonController
// Common controller stuff.
//===============================================
"use strict";

var CommonController = function (m_executor) {
	var self = this;

	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGING, onTurnChanging);
	};

	var onTurnChanging = function (gameState) {
	
		// Cycle through all current units and check if all have finished their turns.
		// If not, use it for healing, if available.
		for(var i = 0; i < gameState.currentPlaceables.length; ++i) {
			var tile = gameState.currentPlaceables[i].CTilePlaceable.tile;
			var availableGOActions = m_executor.getAvailableActions(tile);

			for(var j = 0; j < availableGOActions.length; ++j) {
				var goActions = availableGOActions[j];

				if (goActions.go.CUnit.finishedTurn)
					continue;

				var action = goActions.getActionByType(Actions.Classes.ActionHeal);
				if (action) {
					m_executor.executeAction(action);
					--j; // Needed in order execute all the turnPoints.
				}
			}
		}
	}
	
}

ECS.EntityManager.registerSystem('CommonController', CommonController);
SystemsUtils.supplySubscriber(CommonController);