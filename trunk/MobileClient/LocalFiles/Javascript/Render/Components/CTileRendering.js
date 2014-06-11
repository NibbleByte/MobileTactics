"use strict";

var CTileRendering = function CTileRendering() {
	this.sprite = null;
	this.spriteHighlight = null;
	this.spriteActionFog = null;
	this.spriteVisibilityFog = null;
	
	this.highlightMode = CTileRendering.HighlightType.None;
};

ComponentsUtils.registerNonPersistent(CTileRendering);

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

CTileRendering.getSpritePath = function (highlightMode) {
	return CTileRendering.SPRITES_PATH.replace(/{fileName}/g, CTileRendering.SPRITES_FILES[highlightMode]);
}
CTileRendering.SPRITES_PATH = 'Assets/Render/Images/TileHighlight/{fileName}';
CTileRendering.SPRITES_FILES = ['',
							'hex_move.png',
							'hex_attack.png'
							];



CTileRendering.prototype.destroy = function () {
	if (this.spriteVisibilityFog) this.spriteVisibilityFog.remove();
	this.spriteActionFog.remove();
	this.spriteHighlight.remove();
	this.sprite.remove();
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
	
	this.spriteHighlight.skipDrawing = false;
	
	this.highlightMode = mode;
	this.spriteHighlight.loadImg(CTileRendering.getSpritePath(this.highlightMode));
	this.spriteHighlight.update();
};

CTileRendering.prototype.unHighlight = function () {
	this.spriteHighlight.skipDrawing = true;
};

CTileRendering.prototype.showActionFog = function () {
	this.spriteActionFog.skipDrawing = false;
}

CTileRendering.prototype.hideActionFog = function () {
	this.spriteActionFog.skipDrawing = true;
}

CTileRendering.prototype.showVisibilityFog = function () {
	this.spriteVisibilityFog.skipDrawing = false;
}

CTileRendering.prototype.hideVisibilityFog = function () {
	this.spriteVisibilityFog.skipDrawing = true;
}



CTileRendering.prototype.move = function (x, y) {
	this.sprite.position(x, y);
	this.sprite.update();
	
	this.spriteHighlight.position(x, y);
	this.spriteHighlight.update();
	
	this.spriteActionFog.position(x, y);
	this.spriteActionFog.update();
	
	// If fog is allowed.
	if (this.spriteVisibilityFog) {
		this.spriteVisibilityFog.position(x, y);
		this.spriteVisibilityFog.update();
	}
}
