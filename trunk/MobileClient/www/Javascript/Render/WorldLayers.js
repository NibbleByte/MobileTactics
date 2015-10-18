//===============================================
// WorldLayers
// Provides collection of layers for rendering out elements.
//===============================================
"use strict";

var WorldLayers = {};

WorldLayers.LayerTypes = {
	Terrain: 0,
	Selection: 1,
	Units: 2,
	UnitsFinished: 3,
	Highlights: 4,	// Combine highlight & action fog to gain performance. But highlights will be above unit :(
	ActionFog: 4,
	VisibilityFog: 5,
	Statistics: 6,
	OverlayEffects: 7,

	Debug: 8,
};
//Enums.enumerate(WorldLayers.LayerTypes);
// LayerTypes are no longer enum since some layers are merged (i.e. are the same).

WorldLayers.SpritesDefaultDepth = {
	Terrain: 200,
	Selection: 180,
	Units: 140,
	UnitsFinished: 120,
	Highlights: 100,
	ActionFog: 80,
	VisibilityFog: 60,
	Statistics: 40,
	OverlayEffects: 20,

	Debug: -100,
}

WorldLayers.layersOptions = {
	

	Terrain: {
		useCanvas: false,
		autoClear: false,
	},

	Selection: {
		useCanvas: false,
		autoClear: false,
	},

	Units: {
		useCanvas: false,
		autoClear: false,
		useCanvasInstance: !RenderUtils.supportsDataUrl,
	},

	UnitsFinished: {
		useCanvas: false,
		autoClear: false,
		static: true,
	},

	Highlights: {
		useCanvas: false,
		autoClear: false,
		static: true,
	},

	ActionFog: {
		useCanvas: false,
		autoClear: false,
		static: true,
	},
	
	VisibilityFog: {
		useCanvas: false,
		autoClear: false,
		static: true,
	},


	Statistics: {
		useCanvas: false,
		disableZoom: true,
		static: true,
	},

	OverlayEffects: {
		useCanvas: false,
		disableZoom: true,
		static: true,
	},



	Debug: {
		useCanvas: false,
		autoClear: false,
		static: true,
	},
}