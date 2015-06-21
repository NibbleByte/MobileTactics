//===============================================
// FightRenderer (Extends SceneRenderer)
// Specializes the rendering for Fight.
// Adds additional functions.
//===============================================
"use strict";

var FightRenderer = new function () {

	this.Build = function (holderElement, eworld) {
		var renderer = new SceneRenderer(holderElement, eworld, FightRenderer);

		renderer.$pnScenePlot.addClass('fight_scene_plot');

		return renderer;
	}
}

FightRenderer.DirectionType = {
	Left: -1,
	Right: 1,
}

FightRenderer.LayerTypes = {
	Background: 0,
	Units: 0,
	Particles: 0,
};
Enums.enumerate(FightRenderer.LayerTypes);

FightRenderer.layersOptions = {

	Background: {
		useCanvas: false,
		autoClear: false,
	},

	Units: {
		useCanvas: false,
		autoClear: false,
		useCanvasInstance: true,
	},

	Particles: {
		useCanvas: false,
		autoClear: false,
	},
};
