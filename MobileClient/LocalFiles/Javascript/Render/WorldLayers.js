//===============================================
// WorldLayers
// Provides collection of layers for rendering out elements.
//===============================================
"use strict";

var WorldLayers = {};

WorldLayers.LayerTypes = {
	Terrain: 0,
	Selection: 0,
	TerrainOverlay: 0,
	VisibilityFog: 0,
	Highlights: 0,
	Units: 0,
	Statistics: 0,
	ActionFog: 0,
};
Enums.enumerate(WorldLayers.LayerTypes);

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
		useCanvas: true,
		autoClear: false,
	},

	ActionFog: {
		useCanvas: true,
		autoClear: false,
	},
}