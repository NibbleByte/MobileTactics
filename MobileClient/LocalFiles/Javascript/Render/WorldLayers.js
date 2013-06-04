//===============================================
// WorldLayers
// Provides collection of layers for rendering out elements.
//===============================================
"use strict";

var WorldLayers = function (layersContainer) {
	var self = this;
	
	this.attachTo = function (layerType, element) {
		console.assert(Enums.isValidValue(WorldLayers.LayerTypes, layerType));
		
		m_layers[layerType].append(element);
	}
	
	this.detach = function (element) {
		$(element).detach();
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
	Highlights: 0,
	Units: 0,
	Statistics: 0,
};
Enums.enumerate(WorldLayers.LayerTypes);
