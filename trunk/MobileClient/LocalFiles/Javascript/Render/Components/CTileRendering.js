"use strict";

var CTileRendering = function () {
	this.sprite = null;
	this.spriteHighlight = null;
	
	this.highlightMode = CTileRendering.HighlightType.None;
};

ComponentsUtils.registerNonPersistent('CTileRendering', CTileRendering);

CTileRendering.HighlightType = {
		None: 0,
		Move: 0,
		Attack: 0,
	};
Enums.enumerate(CTileRendering.HighlightType);


// TODO: Maybe classes should be defined somewhere else, like in the system. highlight modes/selection too.
CTileRendering.prototype.CLASSES = {
		TILE_SELECTED: 'tile_selected',
		
		HIGHLIGHT_SELECTED: 'tile_highlight_selected',
		HIGHLIGHT_MODES: [
						  '',
						  'tile_highlight_move',
						  'tile_highlight_attack'
						  ],
}



//
// Short-cuts
//

CTileRendering.prototype.unSelect = function () {
	$(this.sprite.dom).removeClass(this.CLASSES.TILE_SELECTED);
};

CTileRendering.prototype.select = function () {
	$(this.sprite.dom).addClass(this.CLASSES.TILE_SELECTED);
};

CTileRendering.prototype.isSelected = function () {
	return $(this.sprite.dom).hasClass(this.CLASSES.TILE_SELECTED);
};



CTileRendering.prototype.highlight = function (mode) {
	console.assert(Enums.isValidValue(CTileRendering.HighlightType, mode));
	
	// Un-highlighting
	if (mode == CTileRendering.HighlightType.None) {
		this.unHighlight();
		return;
	}
	
	// Remove old highlight
	if (this.highlightMode != CTileRendering.HighlightType.None) {
		$(this.spriteHighlight.dom).removeClass(this.CLASSES.HIGHLIGHT_MODES[this.highlightMode]);
	}
	
	this.highlightMode = mode;
	$(this.spriteHighlight.dom).addClass(this.CLASSES.HIGHLIGHT_MODES[this.highlightMode]);
};

CTileRendering.prototype.unHighlight = function () {
	if (this.highlightMode != CTileRendering.HighlightType.None) {
		$(this.spriteHighlight.dom).removeClass(this.CLASSES.HIGHLIGHT_MODES[this.highlightMode]);
		this.highlightMode = CTileRendering.HighlightType.None;
	}		
};