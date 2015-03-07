//===============================================
// ActionRender
// Controls the action menu and actions rendering.
//===============================================
"use strict";

var ActionsMenuController = function (actionMenuElement) {
	var self = this;
	
	console.assert(actionMenuElement instanceof HTMLElement, "HTMLElement is required.");
	
	var m_$actionMenu = $(actionMenuElement);
	var m_isMenuShown = false;	// Optimization, to avoid modifying the dom in vain.
	var m_menuEntries = {};
	var m_currentGOActions = null;
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(ClientEvents.Controller.ACTIONS_OFFERED, onActionsOffered);
		self._eworldSB.subscribe(ClientEvents.Controller.ACTIONS_CLEARED, onActionsCleared);
		
		// Initialize
		m_$actionMenu
		.click(onMenuClicked)
		.hide();
		m_isMenuShown = false;
		
		var prettyNames = ActionsRender.getActionPrettyNames();
		for(var actionName in prettyNames) {
			var $entry = appendEntry(actionName, prettyNames[actionName]);
			
			m_menuEntries[actionName] = $entry;
		}
		
		// Add explicit cancel button.
		appendEntry(ActionsMenuController.CANCEL_ACTION_NAME, 'Cancel')
		.show();
	};
	
	this.uninitialize = function () {
		m_$actionMenu.empty();
	};
	
	var appendEntry = function (actionName, prettyName) {
		return $('<div class="action_menu_entry"></div>')
		.text(prettyName)
		.hide()
		.attr('actionName', actionName)
		.appendTo(m_$actionMenu);
	}
	
	var showEntries = function (entries) {
		for(var i = 0; i < entries.length; ++i) {
			var $entry = m_menuEntries[entries[i]];
			$entry.show();
		}
		
		m_$actionMenu.show();
		m_isMenuShown = true;
	}
	
	var hideEntries = function () {		
		for(var actionName in m_menuEntries) {
			m_menuEntries[actionName].hide();
		}
	}
	
	var onMenuClicked = function (event) {
		var actionName = $(event.target).attr('actionName');
		
		// Check if cancel button.
		if (actionName == ActionsMenuController.CANCEL_ACTION_NAME) {
			self._eworld.trigger(ClientEvents.Controller.ACTION_CANCEL);
			event.stopImmediatePropagation();
			return;
		}
		
		if (actionName) {
			for(var i = 0; i < m_currentGOActions.actions.length; ++i) {
				if (m_currentGOActions.actions[i].actionType.actionName == actionName) {
					var action = m_currentGOActions.actions[i];

					// If no tiles were available consider this action as quick (menu-accessible only).
					if (action.availableTiles && !action.actionType.quickAction) {
						var goActions = new GameObjectActions(m_currentGOActions.go, [action]);
						self._eworld.trigger(ClientEvents.Controller.ACTIONS_OFFERED, goActions);
					
					} else {
						self._eworld.trigger(ClientEvents.Controller.ACTION_PREEXECUTE, action);
					}

				}
			}
		}
	}

	var shouldHideMenu = function (goActions) {

		// Show only if current player is me.
		if (goActions.go.CPlayerData.player != self._eworld.extract(GameState).currentPlayer)
			return true;

		// Don't show if there are 0 or only Move/Attack available choices.
		var actions = goActions.actions;
		return actions.length == 0 || (
			actions.length == 1 && (
				actions[0].actionType == Actions.Classes.ActionMove ||
				actions[0].actionType == Actions.Classes.ActionAttack
			)
		)
	}
	
	var onActionsOffered = function (event, goActions) {
		m_currentGOActions = goActions;
		
		if (shouldHideMenu(m_currentGOActions)) {
			onActionsCleared();
			return;
		}
		
		hideEntries();
		
		for(var i = 0; i < m_currentGOActions.actions.length; ++i) {
			
			var $entry = m_menuEntries[m_currentGOActions.actions[i].actionType.actionName];
			$entry.show();
		}
		
		m_$actionMenu.show();
		m_isMenuShown = true;
	}
	
	var onActionsCleared = function () {
		if (m_isMenuShown) {
			m_$actionMenu.hide();
			m_isMenuShown = false;
		
			hideEntries();
		}
	}
};

ActionsMenuController.CANCEL_ACTION_NAME = '$ActionCancel';

ECS.EntityManager.registerSystem('ActionsMenuController', ActionsMenuController);
SystemsUtils.supplySubscriber(ActionsMenuController);