//===============================================
// MapStorage.js
// Read/write maps.
//===============================================
"use strict";

var MapsStorage = new function () {
	var self = this;

	this.maps = [
		'Dance42',
		'HexIsle',
		'UnitTesting',
		'MissingMap',
	];

	var MAPS_PATH = 'Assets/Maps/{fileName}.json';

	this.loadMap = function (mapName, onSuccess, onFail) {
		if (Utils.assert(self.maps.contains(mapName), 'Unknown map name: ' + mapName))
			return;

		$.get(MAPS_PATH.replace('{fileName}', mapName), null, null, 'text')
		.done(function (data) {
			onSuccess(data);
		})
		.fail(function (xhr) {
			if (onFail)
				onFail(xhr.status, xhr.responseText);
		});
	};
};
