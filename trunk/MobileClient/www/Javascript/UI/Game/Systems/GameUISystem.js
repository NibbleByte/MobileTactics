//===============================================
// GameUISystem
// 
//===============================================
"use strict";

var GameUISystem = function () {
	var self = this;

	var m_states = [ GameUISystem.States.None ];

	this.initialize = function () {
		self._eworldSB.subscribe(ClientEvents.UI.PUSH_STATE, onPushState);
		self._eworldSB.subscribe(ClientEvents.UI.PUSH_STATE_CHECK, onPushStateCheck);
		self._eworldSB.subscribe(ClientEvents.UI.POP_STATE, onPopState);
		self._eworldSB.subscribe(ClientEvents.UI.SET_STATE, onSetState);
	}


	var onPopState = function () {

		if (m_states.length <= 1)
			return;

		var prevState = m_states.pop();
		var currentState = m_states.last();

		self._eworld.blackboard[ClientBlackBoard.UI.CURRENT_STATE] = currentState;
		self._eworld.trigger(ClientEvents.UI.STATE_CHANGED, currentState, prevState);
	}

	var onPushState = function (state) {
		var prevState = m_states.last();

		m_states.push(state);

		self._eworld.blackboard[ClientBlackBoard.UI.CURRENT_STATE] = state;
		self._eworld.trigger(ClientEvents.UI.STATE_CHANGED, state, prevState);
	}

	var onPushStateCheck = function (state) {
		if (m_states.last() != state) {
			onPushState(state);
		}
	}

	var onSetState = function (state) {
		var prevState = m_states.last();
		m_states = [ GameUISystem.States.None, state ];

		self._eworld.blackboard[ClientBlackBoard.UI.CURRENT_STATE] = state;
		self._eworld.trigger(ClientEvents.UI.STATE_CHANGED, state, prevState);
	}
}

ECS.EntityManager.registerSystem('GameUISystem', GameUISystem);
SystemsUtils.supplySubscriber(GameUISystem);

GameUISystem.States = {
	None: 0,
	Hidden: 0,
	HUD: 0,
	AI: 0,
	TurnChanged: 0,
	Menu: 0,
	UnitInfo: 0,
	GameStateInfo: 0,
}
Enums.enumerate(GameUISystem.States);