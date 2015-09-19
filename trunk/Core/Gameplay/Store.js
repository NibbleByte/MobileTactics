//===============================================
// Store
// All the store/shop functionality.
//===============================================
"use strict";

var Store = new function () {

	var self = this;

	this.canPlayerShop = function (eworld, tile, opt_player) {

		// Currently only base tiles sell placeables.
		if (tile.CTileTerrain.type != GameWorldTerrainType.Base && tile.CTileTerrain.type != GameWorldTerrainType.Factory)
			return false;

		if (tile.CTile.placedObjects.length > 0)
			return false;

		if (!opt_player) {
			var gameState = eworld.extract(GameState);
			opt_player = gameState.currentPlayer;
		}

		if (opt_player != tile.CTileOwner.owner)
			return false;

		return true;
	}
	
	this.getPriceListFromTile = function (eworld, tile) {
		var list = [];

		if (tile.CTileTerrain.type != GameWorldTerrainType.Base && tile.CTileTerrain.type != GameWorldTerrainType.Factory)
			return list;

		var gameState = eworld.extract(GameState);
		var player = tile.CTileOwner.owner;

		// Base not owned, cannot buy.
		if (!player)
			return list;
		
		var raceDefinitions = UnitsDefinitions[player.race];
		
		// TODO: use the gameState to check if there are excluded units for this map/game.
		for(var name in raceDefinitions) {
			var storeItem = new StoreItem(raceDefinitions[name], raceDefinitions[name].price, player, eworld);
			storeItem.tile = tile;

			list.push(storeItem);
		}

		return list;
	};

	this.canBuyItem = function (storeItem) {

		if (!self.canPlayerShop(storeItem.eworld, storeItem.tile))
			return false;

		var gameState = storeItem.eworld.extract(GameState);

		if (gameState.credits[storeItem.player.playerId] < storeItem.price) {
			return false;
		}

		return true;
	}

	this.buyItem = function (storeItem) {

		var eworld = storeItem.eworld;
		var world = eworld.extract(GameWorld);
		var gameState = eworld.extract(GameState);
		var gameExecutor = eworld.extract(GameExecutor);

		if (Utils.assert(gameState.currentPlayer == storeItem.player, 'Cannot buy item for another player.'))
			return null;

		if (Utils.assert(storeItem.tile.CTile.placedObjects.length == 0, 'Tile is occupied by another unit.'))
			return null;

		if (!self.canBuyItem(storeItem)) {
			return null;
		}

		var placeable = UnitsFactory.createUnit(storeItem.definition, storeItem.player);
		
		var action = new GameAction(Actions.Classes.ActionBuy, storeItem.player, placeable);
		action.appliedTile = storeItem.tile;
		action.undoData = storeItem;

		gameExecutor.executeAction(action);

		// Placeable starts with a clean slate
		placeable.CUnit.actionsData.clearExecutedActions();
		
		eworld.trigger(GameplayEvents.Store.PLACEABLE_BOUGHT, placeable);

		return action;
	};
};

var StoreItem = function (definition, price, player, eworld) {
	this.name = definition.name;
	this.definition = definition;
	this.price = price;
	this.player = player;
	this.eworld = eworld;

	this.tile = null;
}