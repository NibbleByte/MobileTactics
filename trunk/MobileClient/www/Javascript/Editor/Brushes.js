//===============================================
// Brushes
// Editor brushes
//===============================================
"use strict";

var TerrainBrush = function (m_eworld, m_world, terrainType) {
	var self = this;
	
	this.terrainType = terrainType;

	this.place = function (row, column, tile) {
		
		if (tile) {
			
			if (tile.CTile.placedObjects.length > 0 && !tile.CTile.placedObjects[0].CStatistics.terrainStats[self.terrainType]) {
				tile.CTile.placedObjects[0].destroy();
			}

			// Prepare needed ownerable components
			var wasOwnerable = TileCapturingSystem.isOwnerableTile(tile.CTileTerrain.type);
			var isOwnerable = TileCapturingSystem.isOwnerableTile(self.terrainType);

			if (!wasOwnerable && isOwnerable)
				tile.addComponent(CTileOwner);
			if (wasOwnerable && !isOwnerable)
				tile.removeComponent(CTileOwner);

			tile.CTileTerrain.type = self.terrainType;
			tile.CTileTerrain.skin = MathUtils.randomIntRange(0, GameWorldTerrainSkin[self.terrainType].length);

			m_eworld.trigger(EngineEvents.World.TILE_CHANGED, tile);
		}
	}
}

var UnitsBrush = function (m_eworld, m_world, unitDefinition, player) {
	var self = this;
	
	this.unitDefinition = unitDefinition;
	this.player = player;

	var terrainBrush = new TerrainBrush(m_eworld, m_world, 0);

	this.place = function (row, column, tile) {
		
		if (tile) {

			while(tile.CTile.placedObjects.length > 0) {
				tile.CTile.placedObjects[0].destroy();
			}

			var terrainType = tile.CTileTerrain.type;

			// Find the first available terrain type this unit can be placed, if current is not suitable.
			if (!self.unitDefinition.terrainStats[terrainType]) {
				for(terrainType = 0; !self.unitDefinition.terrainStats[terrainType]; ++terrainType);

				terrainBrush.terrainType = terrainType;
				terrainBrush.place(row, column, tile);
			}

			var unit = UnitsFactory.createUnit(self.unitDefinition, self.player);
			m_eworld.addUnmanagedEntity(unit);
			m_world.place(unit, tile);
		}
	}
}