//===============================================
// GameWorldRenderer (Extends SceneRenderer)
// Specializes the rendering for GameWorld (tile based).
// Adds additional functions.
//===============================================
"use strict";

var BattleFieldRenderer = new function () {

	this.Build = function (holderElement, eworld, direction) {
		var renderer = new SceneRenderer(holderElement, eworld, BattleFieldRenderer);

		$.extend(renderer, extension);

		renderer.direction = direction;

		return renderer;
	}

	var extension = {
		refreshScaleTo: function (width, height) {

			// Resize the layer element, rather the canvas attributes, to scale-down the canvas image.
			// For this to work, all layers must be canvas!
			for(var i = 0; i < this.layers.length; ++i) {
				var $el = $(this.layers[i].dom);
				$el.width(width);
				$el.height(height);
			}

			$(this.scene.dom).width(width);
			$(this.scene.dom).height(height);
		},
	};
}

BattleFieldRenderer.DirectionType = {
	Left: -1,
	Right: 1,
}

BattleFieldRenderer.LayerTypes = {
	Background: 0,
	Units: 0,
	Particles: 0,
};
Enums.enumerate(BattleFieldRenderer.LayerTypes);

BattleFieldRenderer.layersOptions = {

	Background: {
		useCanvas: true,
		autoClear: false,
	},

	Units: {
		useCanvas: true,
		autoClear: false,
	},

	Particles: {
		useCanvas: true,
		autoClear: false,
	},
};
