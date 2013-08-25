"use strict";

var CTileRendering = function () {
	this.$renderedTile = $('<div class="tile"></div>');
	
	this.$renderedHighlight = $('<div class="tile_highlight"></div>');
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

CTileRendering.prototype.renderAt = function (row, column) {
	
	var hOffset = (column % 2) ? GTile.TILE_HOFFSET : 0;
	var vOffset = (column % 2) ? -GTile.TILE_VOFFSET : 0;
	
	var x = hOffset + Math.floor(column / 2) * (GTile.TILE_WIDTH + GTile.TILE_SIDE);
	var y = vOffset + (row - Math.floor(column / 2)) * GTile.TILE_HEIGHT;
	
	this.$renderedTile
	.css('left', x + GTile.LAYERS_PADDING + 'px')
	.css('top', y + GTile.LAYERS_PADDING + 'px');
	
	this.$renderedHighlight
	.css('left', x  + GTile.LAYERS_PADDING + 'px')
	.css('top', y + GTile.LAYERS_PADDING  + 'px');
	
	/////////////////////////////////////////////////////////
	// DEBUG: Debug visualization
	
	this.$renderedTile
	.html(	'<br />' +
			'RC: ' + row + ', ' + column +
			'<br />' +
			'X: ' + parseInt(this.$renderedTile.css('left')) +
			'<br />' +
			'Y: ' + parseInt(this.$renderedTile.css('top')));
	// DEBUG: Color every even column
	if (row % 2)
		this.$renderedTile
		.css('background', 'url("Assets/Render/Images/hex_bluesh.png") no-repeat')
		.css('background-size', '100% 100%');
};

CTileRendering.prototype.getRenderedXY = function () {
	return {
			y: parseFloat(this.$renderedTile.css('top')),
			x: parseFloat(this.$renderedTile.css('left'))
			};
};

CTileRendering.prototype.getRenderedCenterXY = function () {
	var coords = this.getRenderedXY();
	coords.y += GTile.TILE_HEIGHT / 2;
	coords.x += GTile.TILE_WIDTH / 2;
	
	return coords;
};



CTileRendering.prototype.unSelect = function () {
	this.$renderedTile.removeClass(this.CLASSES.TILE_SELECTED);
};

CTileRendering.prototype.select = function () {
	this.$renderedTile.addClass(this.CLASSES.TILE_SELECTED);
};

CTileRendering.prototype.isSelected = function () {
	return this.$renderedTile.hasClass(this.CLASSES.TILE_SELECTED);
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
		this.$renderedHighlight.removeClass(this.CLASSES.HIGHLIGHT_MODES[this.highlightMode]);
	}
	
	this.highlightMode = mode;
	this.$renderedHighlight.addClass(this.CLASSES.HIGHLIGHT_MODES[this.highlightMode]);
};

CTileRendering.prototype.unHighlight = function () {
	if (this.highlightMode != CTileRendering.HighlightType.None) {
		this.$renderedHighlight.removeClass(this.CLASSES.HIGHLIGHT_MODES[this.highlightMode]);
		this.highlightMode = CTileRendering.HighlightType.None;
	}		
};