//===============================================
// WorldLayers
// Provides collection of layers for rendering out elements.
//===============================================
"use strict";

var WorldLayers = {};

WorldLayers.LayerTypes = {
	Terrain: 0,
	Selection: 1,
	TerrainOverlay: 1,
	Highlights: 1,
	Units: 2,
	VisibilityFog: 3,
	ActionFog: 3,
	Statistics: 4,
	
};
//Enums.enumerate(WorldLayers.LayerTypes);
// LayerTypes are no longer enum since some layers are merged (i.e. are the same).

WorldLayers.SpritesDefaultDepth = {
	Terrain: 100,
	Selection: 90,
	TerrainOverlay: 80,
	Highlights: 70,
	Units: 60,
	VisibilityFog: 50,
	ActionFog: 40,
}

WorldLayers.layersOptions = {
	

	Terrain: {
		useCanvas: true,
		autoClear: false,
	},

	Selection: {
		useCanvas: true,
		autoClear: false,
	},

	TerrainOverlay: {
		useCanvas: true,
		autoClear: false,
	},
	
	VisibilityFog: {
		useCanvas: true,
		autoClear: false,
	},

	Highlights: {
		useCanvas: true,
		autoClear: false,
	},

	Units: {
		useCanvas: false,
		autoClear: false,
		useCanvasInstance: true,
	},

	ActionFog: {
		useCanvas: true,
		autoClear: false,
	},
}