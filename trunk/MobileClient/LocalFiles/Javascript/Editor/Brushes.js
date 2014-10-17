//===============================================
// Brushes
// Editor brushes
//===============================================
"use strict";

var TerrainBrush = function (eworld, world, terrainType) {

	this.terrainType = terrainType;

	this.place = function (row, column) {
		console.log('Place at:' + row + ', ' + column);
	}

	this.destroy = function () {
	}
}