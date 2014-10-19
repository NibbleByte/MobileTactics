//===============================================
// Brushes
// Editor brushes
//===============================================
"use strict";

var TerrainBrush = function (eworld, world, terrainType) {
	var self = this;
	
	this.terrainType = terrainType;

	this.place = function (row, column, tile) {
		
		if (tile) {

			// Prepare needed ownerable components
			var wasOwnerable = TileCapturingSystem.isOwnerableTile(tile.CTileTerrain.type);
			var isOwnerable = TileCapturingSystem.isOwnerableTile(self.terrainType);

			if (!wasOwnerable && isOwnerable)
				tile.addComponent(CTileOwner);
			if (wasOwnerable && !isOwnerable)
				tile.removeComponent(CTileOwner);

			tile.CTileTerrain.type = self.terrainType;

			eworld.trigger(EngineEvents.World.TILE_CHANGED, tile);
		}
	}

	this.destroy = function () {
	}
}