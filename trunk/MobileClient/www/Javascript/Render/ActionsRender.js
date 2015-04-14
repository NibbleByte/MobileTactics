//===============================================
// ActionRender
// Controls the action menu and actions rendering.
//===============================================
"use strict";

var ActionsRender = new function () {
	var self = this;
	
	var m_prettyNames = {}
	var m_highlightModes = {}
	
	var registerAction = function (action, prettyName, highlightMode) {
		var actionName = action.actionName;
		
		m_prettyNames[actionName] = prettyName;
		m_highlightModes[actionName] = highlightMode;
	}
	
	
	// Action definitions
	registerAction(Actions.Classes.ActionMove, 'Move', CTileRendering.HighlightType.Move);
	registerAction(Actions.Classes.ActionCapture, 'Capture', CTileRendering.HighlightType.Move);
	registerAction(Actions.Classes.ActionStay, 'Stay', CTileRendering.HighlightType.Move);
	registerAction(Actions.Classes.ActionAttack, 'Attack', CTileRendering.HighlightType.Attack);
	registerAction(Actions.Classes.ActionHeal, 'Heal', CTileRendering.HighlightType.Move);
	
	
	
	this.highlightTileAction = function (tile, action) {
		self.highlightTile(tile, action.actionType);
	}

	this.highlightTile = function (tile, actionType) {
		var mode = m_highlightModes[actionType.actionName];
		
		console.assert(mode != undefined, 'Unsupported highlight type.');
		
		tile.CTileRendering.highlight(mode);
	};
	
	this.unHighlightTile = function (tile) {
		tile.CTileRendering.unHighlight();
	};
	
	this.getActionPrettyNames = function () {
		return m_prettyNames;
	}
};



