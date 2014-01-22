"use strict";

var CTileRendering = function () {
	this.sprite = null;
	this.spriteHighlight = null;
	this.spriteFog = null;
	
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
}

CTileRendering.SPRITES_PATH = 'Assets/Render/Images/TileHighlight/';
CTileRendering.SPRITES_FILES = ['',
							'hex_move.png',
							'hex_attack.png'
							];


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
	
	$(this.spriteHighlight.dom).show();
	
	this.highlightMode = mode;
	this.spriteHighlight.loadImg(CTileRendering.SPRITES_PATH + CTileRendering.SPRITES_FILES[this.highlightMode]);
};

CTileRendering.prototype.unHighlight = function () {
	$(this.spriteHighlight.dom).hide();
};

CTileRendering.prototype.showFog = function () {
	$(this.spriteFog.dom).show();
}

CTileRendering.prototype.hideFog = function () {
	$(this.spriteFog.dom).hide();
}



CTileRendering.prototype.move = function (x, y) {
	this.sprite.position(x, y);
	this.sprite.update();
	
	this.spriteHighlight.position(x, y);
	this.spriteHighlight.update();
	
	this.spriteFog.position(x, y);
	this.spriteFog.update();
}

CTileRendering.prototype.detach = function () {
	this.spriteHighlight.remove();
	this.sprite.remove();
}