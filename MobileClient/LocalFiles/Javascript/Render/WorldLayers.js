//===============================================
// WorldLayers
// Provides collection of layers for rendering out elements.
//===============================================
"use strict";

var WorldLayers = function (layersContainer) {
	var self = this;
	
	this.attachTo = function (layerType, element) {
		console.assert(typeof layerType == "number");
		
		m_layers[layerType].append(element);
	}
	
	//
	// Private
	//
	
	var m_layers = new Array(Object.keys(WorldLayers.LayerTypes).length); 
	for(var layer in WorldLayers.LayerTypes) {
		m_layers[WorldLayers.LayerTypes[layer]] =
		$('<div></div>')
		.attr('id', 'Layer_' + layer)
		.appendTo(layersContainer);
	}
}

WorldLayers.LayerTypes = {
	Terrain: 0,
	Buildings: 0,
	Selections: 0,
	Units: 0,
	Statistics: 0,
};
Enums.enumerate(WorldLayers.LayerTypes);
