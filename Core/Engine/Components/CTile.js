"use strict";

var CTile = function (go_this) {
	var self = this;
	
	//
	// Position
	//
	
	// Setter (once)/getter
	this.UMessage('row', function (row) {
		if (row == undefined) {
			console.assert(m_row !== null, 'Tile position not set yet!');
			return m_row;
		} else {
			console.assert(m_row === null, 'Tiles can\'t be moved more than once!');
			m_row = row;
		}
		
	});
	
	// Setter (once)/getter
	this.UMessage('column', function (column) {
		if (column == undefined) {
			console.assert(m_column !== null, 'Tile position not set yet!');
			return m_column;
		} else {
			console.assert(m_column === null, 'Tiles can\'t be moved more than once!');
			m_column = column;
		}

	});
	
	
	// 
	// Objects
	// 
	this.UMessage('getPlacedObjects', function () {
		return m_placedObjects;
	});
	
	this.UMessage('placeObject', function (obj) {
		var foundIndex = m_placedObjects.indexOf(obj);
		
		if (foundIndex > -1)
			return;
		
		// Detach from previous tile
		var oldTile = obj.tile();
		if (oldTile) {
			oldTile.removeObject(obj);
		}

		
		obj.tile(go_this);
		m_placedObjects.push(obj);
	});
	
	this.UMessage('removeObject', function (obj) {
		var foundIndex = m_placedObjects.indexOf(obj);
		
		if (foundIndex == -1)
			return false;
		
		obj.tile(null);
		m_placedObjects.splice(foundIndex, 1);
		
		return true;
	});
	
	
	//
	// Algorithms
	//
	this.UMessage('movementCostLeft', function (costLeft) {
		if (costLeft == undefined) {
			return m_movementCostLeft;
		} else {
			m_movementCostLeft = costLeft;
		}
	});
	
	
	//
	// Private
	//
	var m_row = null;
	var m_column = null;
	
	var m_placedObjects = [];
	var m_movementCostLeft = 0;
};

EntityManager.registerComponent('CTile', CTile);