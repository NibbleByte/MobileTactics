"use strict";

var CTileHighlight = function (go_this) {
	var self = this;
	
	// 
	// Private
	//
	var clearRender = function () {
		m_$renderedSelect.detach();
	}
	
	
	//
	// Public messages
	//
	this.MMessage('renderAttach', function (worldLayers) {
		m_layers = worldLayers;
		
		var coords = go_this.getRenderedXY();
		m_$renderedHighlight
		.css('left', coords.x + 'px')
		.css('top', coords.y + 'px')
	});
	
	this.MMessage('clearRender', clearRender);
	
	
	// Change highlight
	this.UMessage('highlight', function (action) {
		var mode;
		
		switch (action.componentId) {
			case CActionMove.prototype.getComponentId():
				mode = CTileHighlight.HighlightType.Move;
			break;
			
			case CActionAttack.prototype.getComponentId():
				mode = CTileHighlight.HighlightType.Attack;
				break;
				
			default:
				mode = CTileHighlight.HighlightType.None;
				console.assert(false, 'Unsupported highlight type.');
				break;
		}		
		console.assert(Enums.isValidValue(CTileHighlight.HighlightType, mode));
		
		// Un-highlighting
		if (mode == CTileHighlight.HighlightType.None) {
			go_this.unHighlight();
			return;
		}
		
		// Remove old highlight
		if (m_highlightMode != CTileHighlight.HighlightType.None) {
			m_$renderedHighlight.removeClass(CLASSES.HIGHLIGHT_MODES[m_highlightMode]);
		}
		
		m_highlightMode = mode;
		m_$renderedHighlight.addClass(CLASSES.HIGHLIGHT_MODES[m_highlightMode]);
		
		if (m_$renderedHighlight.parent().length == 0)
			m_layers.attachTo(WorldLayers.LayerTypes.Highlights, m_$renderedHighlight);
	});
	
	// Remove any highlight
	this.UMessage('unHighlight', function () {
		if (m_highlightMode != CTileHighlight.HighlightType.None) {
			m_$renderedHighlight.removeClass(CLASSES.HIGHLIGHT_MODES[m_highlightMode]);
			m_highlightMode = CTileHighlight.HighlightType.None;
			
			if (m_$renderedHighlight.parent().length > 0)
				m_layers.detach(m_$renderedHighlight);
		}		
	});
	
	
	
	this.MMessage('destroy', function () {
		clearRender();
	});
	
	//
	// Classes
	//
	// TODO: Move to static
	var CLASSES = {
			HIGHLIGHT_SELECTED: 'tile_highlight_selected',
			HIGHLIGHT_MODES: [
			                  '',
			                  'tile_highlight_move',
			                  'tile_highlight_attack'
			                  ],
	}
	
	//
	// Private
	//
	var m_layers = null;
	var m_$renderedHighlight = $('<div class="tile_highlight"></div>');
	var m_$renderedSelect = $('<div class="tile_select"></div>');
	var m_highlightMode = 0;
};

CTileHighlight.HighlightType = {
		None: 0,
		Move: 0,
		Attack: 0,
	};
Enums.enumerate(CTileHighlight.HighlightType);

EntityManager.registerComponent('CTileHighlight', CTileHighlight);
EntityManager.addComponentDependencies(CTileRendering, CTileHighlight);