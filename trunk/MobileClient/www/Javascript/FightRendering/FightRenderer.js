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
		renderer.disableSceneZoom = true;

		$.extend(renderer, extension);

		return renderer;
	}

	var extension = {
		refreshScaleTo: function (scaleFactor) {

			$(this.$pnScenePlot).css({
				'-webkit-transform'	: 'scale(' + scaleFactor + ')',
				'-moz-transform'	: 'scale(' + scaleFactor + ')',
				'-ms-transform'		: 'scale(' + scaleFactor + ')',
				'-o-transform'		: 'scale(' + scaleFactor + ')',
				'transform'			: 'scale(' + scaleFactor + ')'
			});

			$(this.$pnScenePlot).css('margin-left', -Math.floor((this.extentWidth - this.extentWidth * scaleFactor) / 2));
			$(this.$pnScenePlot).css('margin-top', -Math.floor((this.extentHeight - this.extentHeight * scaleFactor) / 2));
		},
	};
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
