//===============================================
// SynchronizationSystem
//
// Synchronized object (adds id & performs queries).
//===============================================
"use strict";

var SynchronizationSystem = function () {
	var self = this;

	var m_entityRegister = {};
	var m_nextId = 0;
	
	this.initialize = function () {

		self._entityFilter.onEntityAddedHandler = onEntityAdded;
		self._entityFilter.onEntityRemovedHandler = onEntityRemoved;

		var entities = self._entityFilter.entities;
		for(var i = 0; i < entities.length; ++i) {
			onEntityAdded(entities[i]);
		}
	}

	this.getEntityById = function (syncId) {
		return m_entityRegister[syncId.toString()];
	}

	this.getIdByEntity = function (entity) {
		if (Utils.assert(entity._syncId, 'Entity is not synchronized')) {
			return null;
		}

		return entity._syncId;
	}



	var onEntityAdded = function (entity) {
		if (entity._syncId === undefined) {
			entity._syncId = m_nextId;
			m_nextId++;
		}

		m_entityRegister[entity._syncId.toString()] = entity;
	}

	var onEntityRemoved = function (entity) {
		delete m_entityRegister[entity._syncId.toString()];
	}
}

SynchronizationSystem.isSynchronizable = function (entity) {
	return entity.hasComponents(CTile) || entity.hasComponents(CTilePlaceable);
}

ECS.EntityManager.registerSystem('SynchronizationSystem', SynchronizationSystem);
SystemsUtils.supplyComponentFilter(SynchronizationSystem, SynchronizationSystem.isSynchronizable);
