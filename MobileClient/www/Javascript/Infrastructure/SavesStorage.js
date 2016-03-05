//===============================================
// SavesStorage.js
// Read/write game saves.
//===============================================
"use strict";

var SavesStorage = new function () {
	var self = this;

	var m_storage = null;

	this.loadGame = function (saveName) {
		return m_storage.get(saveName);
	};

	this.loadGameMetaData = function (saveName) {
		var rawData = JSON.parse(m_storage.get(saveName));
		delete rawData['world'];	// Not needed data.

		var data = Serialization.deserialize(rawData);
		data['gameMetaData'] = data['gameMetaData'] || new GameMetaData();

		return data;
	}

	this.saveGame = function (saveName, data) {
		return m_storage.set(saveName, data);
	};

	this.isValidSave = function (saveName) {
		return m_storage.get(saveName) !== null;
	}


	this.deleteGame = function (saveName) {
		m_storage.remove(saveName);
	}


	var init = function () {
		m_storage = new Persist.Store('MT');
	}
	$(init);
};
