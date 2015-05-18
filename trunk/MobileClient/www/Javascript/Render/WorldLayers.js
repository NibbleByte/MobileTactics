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
	OverlayEffects: 8,

	Debug: 9,
};
//Enums.enumerate(WorldLayers.LayerTypes);
// LayerTypes are no longer enum since some layers are merged (i.e. are the same).

WorldLayers.SpritesDefaultDepth = {
	Terrain: 200,
	Selection: 180,
	TerrainOverlay: 160,
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


	Statistics: {
		useCanvas: false,
		disableZoom: true,
	},

	OverlayEffects: {
		useCanvas: false,
		disableZoom: true,
	},



	Debug: {
		useCanvas: false,
		autoClear: false,
	},
}