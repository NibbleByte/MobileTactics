//===============================================
// ActionRender
// Controls the action menu and actions rendering.
//===============================================
"use strict";

var ActionsMenuController = function (actionMenuElement) {
	var self = this;
	
	console.assert(actionMenuElement instanceof HTMLElement, "HTMLElement is required.");
	
	var m_$actionMenu = $(actionMenuElement);
	var m_menuEntries = {};
	var m_currentActions = null;
	
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
			self._eworld.trigger(ClientEvents.Controller.ACTIONS_CLEARED);
			event.stopImmediatePropagation();
			return;
		}
		
		if (actionName) {
			for(var i = 0; i < m_currentActions.length; ++i) {
				if (m_currentActions[i].actionType.actionName == actionName) {
					var actions = [m_currentActions[i]];
					self._eworld.trigger(ClientEvents.Controller.ACTIONS_OFFERED, [actions]);
				}
			}
		}
	}
	
	var onActionsOffered = function (event, actions) {
		m_currentActions = actions;
		
		// Don't show if only 1 available choice.
		if (actions.length <= 1) {
			onActionsCleared();
			return;
		}
		
		hideEntries();
		
		for(var i = 0; i < actions.length; ++i) {
			
			var $entry = m_menuEntries[actions[i].actionType.actionName];
			$entry.show();
		}
		
		m_$actionMenu.show();
	}
	
	var onActionsCleared = function () {
		m_$actionMenu.hide();
		
		hideEntries();
	}
};

ActionsMenuController.CANCEL_ACTION_NAME = '$ActionCancel';

ECS.EntityManager.registerSystem('ActionsMenuController', ActionsMenuController);
SystemsUtils.supplySubscriber(ActionsMenuController);