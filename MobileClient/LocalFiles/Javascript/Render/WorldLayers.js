//===============================================
// WorldLayers
// Provides collection of layers for rendering out elements.
//===============================================
"use strict";

var WorldLayers = {};

WorldLayers.LayerTypes = {
	Terrain: 0,
	Buildings: 0,
	Highlights: 0,
	Units: 0,
	Statistics: 0,
	Fog: 0,
};
Enums.enumerate(WorldLayers.LayerTypes);
