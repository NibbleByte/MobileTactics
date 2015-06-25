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



CTileRendering.getSpritePath = function (highlightMode) {
	return CTileRendering.SPRITES_PATH.replace(/{fileName}/g, CTileRendering.SPRITES_FILES[highlightMode]);
}
CTileRendering.SPRITES_PATH = 'Assets-Scaled/Render/Images/TileHighlight/{fileName}';
CTileRendering.SPRITES_FILES = ['',
							'hex_move.png',
							'hex_attack.png'
							];



CTileRendering.prototype.destroy = function () {
	if (this.spriteVisibilityFog) this.spriteVisibilityFog.remove();
	if (this.spriteActionFog) this.spriteActionFog.remove();
	if (this.spriteHighlight) this.spriteHighlight.remove();
	this.sprite.remove();
}

//
// Short-cuts
//

CTileRendering.prototype.highlight = function (mode) {
	console.assert(Enums.isValidValue(CTileRendering.HighlightType, mode));
	
	// Un-highlighting
	if (mode == CTileRendering.HighlightType.None) {
		this.unHighlight();
		return;
	}
	
	this.spriteHighlight.show();
	
	this.highlightMode = mode;
	this.spriteHighlight.loadImg(CTileRendering.getSpritePath(this.highlightMode));
	this.spriteHighlight.update();
};

CTileRendering.prototype.unHighlight = function () {
	this.spriteHighlight.hide();
};

CTileRendering.prototype.showActionFog = function () {
	this.spriteActionFog.show();
}

CTileRendering.prototype.hideActionFog = function () {
	this.spriteActionFog.hide();
}

CTileRendering.prototype.showVisibilityFog = function () {
	this.spriteVisibilityFog.show();
}

CTileRendering.prototype.hideVisibilityFog = function () {
	this.spriteVisibilityFog.hide();
}



CTileRendering.prototype.move = function (x, y) {
	this.sprite.position(x, y);
	this.sprite.update();
	
	if (this.spriteHighlight) {
		this.spriteHighlight.position(x, y);
		this.spriteHighlight.update();
	}
	
	if (this.spriteActionFog) {
		this.spriteActionFog.position(x, y);
		this.spriteActionFog.update();
	}
	
	// If fog is allowed.
	if (this.spriteVisibilityFog) {
		this.spriteVisibilityFog.position(x, y);
		this.spriteVisibilityFog.update();
	}
}
