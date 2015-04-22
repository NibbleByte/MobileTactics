//===============================================
// WorldLayers
// Provides collection of layers for rendering out elements.
//===============================================
"use strict";

var WorldLayers = {};

WorldLayers.LayerTypes = {
	Terrain: 0,
	Selection: 1,
	TerrainOverlay: 2,
	Units: 3,
	UnitsFinished: 4,
	Highlights: 5,	// Combine highlight & action fog to gain performance. But highlights will be above unit :(
	ActionFog: 5,
	VisibilityFog: 6,
	Statistics: 7,

	Debug: 8,
};
//Enums.enumerate(WorldLayers.LayerTypes);
// LayerTypes are no longer enum since some layers are merged (i.e. are the same).

WorldLayers.SpritesDefaultDepth = {
	Terrain: 100,
	Selection: 90,
	TerrainOverlay: 80,
	Units: 70,
	UnitsFinished: 60,
	Highlights: 50,
	ActionFog: 40,
	VisibilityFog: 10,
	Statistics: 0,

	Debug: -100,
}

WorldLayers.layersOptions = {
	

	Terrain: {
		useCanvas: true,
		autoClear: false,
	},

	Selection: {
		useCanvas: false,
		autoClear: false,
	},

	TerrainOverlay: {
		useCanvas: false,
		autoClear: false,
		useCanvasInstance: true,
	},

	Units: {
		useCanvas: false,
		autoClear: false,
		useCanvasInstance: true,
	},

	UnitsFinished: {
		useCanvas: false,
		autoClear: false,
	},

	Highlights: {
		useCanvas: true,
		autoClear: false,
	},

	ActionFog: {
		useCanvas: true,
		autoClear: false,
	},
	
	VisibilityFog: {
		useCanvas: true,
		autoClear: false,
	},



	Debug: {
		useCanvas: false,
		autoClear: false,
	},
}