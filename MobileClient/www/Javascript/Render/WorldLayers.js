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
	Terrain: 20,
	Selection: 40,
	Units: 60,
	UnitsFinished: 80,
	Highlights: 100,
	ActionFog: 120,
	VisibilityFog: 140,
	Statistics: 160,
	OverlayEffects: 180,

	Debug: 9999,
}

WorldLayers.layersOptions = {
	

	Terrain: {
		useCanvas: false,
		autoClear: false,
		recycleDOM: true,
		onDestroy: SpriteColorizeManager.recycleDOM,
	},

	Selection: {
		useCanvas: false,
		autoClear: false,
	},

	Units: {
		useCanvas: false,
		autoClear: false,
		useCanvasInstance: !RenderUtils.supportsDataUrl,
		recycleDOM: true,
		onDestroy: SpriteColorizeManager.recycleDOM,
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