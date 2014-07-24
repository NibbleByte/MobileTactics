//===============================================
// Store
// All the store/shop functionality.
//===============================================
"use strict";

var Store = new function () {

	var self = this;

	this.canPlayerShop = function (eworld, tile) {

		// Currently only base tiles sell placeables.
		if (tile.CTileTerrain.type != GameWorldTerrainType.Base)
			return false;

		if (tile.CTile.placedObjects.length > 0)
			return false;

		var gameState = eworld.extract(GameState);

		if (gameState.currentPlayer != tile.CTileOwner.owner)
			return false;

		return true;
	}
	
	this.getPriceListFromTile = function (eworld, tile) {
		var list = [];

		// Currently only base tiles sell placeables.
		if (tile.CTileTerrain.type != GameWorldTerrainType.Base)
			return list;

		var gameState = eworld.extract(GameState);
		var player = tile.CTileOwner.owner;

		// Base not owned, cannot buy.
		if (!player)
			return list;

		// TODO: use the player's race and return a proper list of units.
		// TODO: use the gameState to check if there are excluded units for this map/game.
		for(var name in UnitsDefinitions) {
			var storeItem = new StoreItem(name, UnitsDefinitions[name], UnitsDefinitions[name].price, player, eworld);
			storeItem.tile = tile;

			list.push(storeItem);
		}

		return list;
	};

	this.canBuyItem = function (storeItem) {

		if (!self.canPlayerShop(storeItem.eworld, storeItem.tile))
			return false;

		// TODO: Do check if player have enough money and other prerequisites

		return true;
	}

	this.buyItem = function (storeItem) {

		var eworld = storeItem.eworld;
		var world = eworld.extract(GameWorld);
		var gameState = eworld.extract(GameState);

		if (Utils.assert(gameState.currentPlayer == storeItem.player, 'Cannot buy item for another player.'))
			return null;

		if (Utils.assert(storeItem.tile.CTile.placedObjects.length == 0, 'Tile is occupied by another unit.'))
			return null;

		if (!self.canBuyItem(storeItem)) {
			return null;
		}

		// TODO: Take players money.

		var unit = UnitsFactory.createUnit(storeItem.name, storeItem.player);
		unit.CUnit.turnPoints = 0;
		unit.CUnit.finishedTurn = true;

		eworld.addUnmanagedEntity(unit);
		world.place(unit, storeItem.tile);
		eworld.trigger(GameplayEvents.Store.PLACEABLE_BOUGHT, unit);

		return unit;
	};
};

var StoreItem = function (name, definition, price, player, eworld) {
	this.name = name;
	this.definition = definition;
	this.price = price;
	this.player = player;
	this.eworld = eworld;

	this.tile = null;
}