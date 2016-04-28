//===============================================
// AIUtils.js
// 
//===============================================
"use strict";

var AIUtils = {

	pickTileTowards: function (targetTile, goActions, world, playersData) {

		var goTile = goActions.go.CTilePlaceable.tile;

		var moveAction = goActions.getActionByType(Actions.Classes.ActionMove);

		if (!moveAction)
			return null;

		// Move along path to the objective.
		var mdata = {
			placeable: goActions.go,
			player: goActions.go.CPlayerData.player,
			playersData: playersData,
			world: world,
		};

		var path = world.findPath(goTile, targetTile, AIUtils.safeMovementCostQuery, mdata);

		var moveTile = null;
		for (var i = path.length; i >= 0; --i) {
			var pathTile = path[i];
			if (moveAction.availableTiles.contains(pathTile)) {
				moveTile = pathTile;
				break;
			}
		}


		if (!moveTile) {
			// Can happen if tiles are occupied by friendly units.
			var validTiles = moveAction.actionType.findClosestValidTiles(moveAction.availableTiles, targetTile);
			if (validTiles.length == 0)
				return null;

			moveTile = validTiles[0];
		}

		return moveTile;
	},

	safeMovementCostQuery: function (tile, userData, queryResult, prevTile) {

		var terrainStats = userData.placeable.CStatistics.terrainStats[tile.CTileTerrain.type];

		if (!terrainStats) {
			queryResult.cost = undefined;
			queryResult.passOver = false;
			queryResult.discard = false;
			return;
		}

		// Check if has any placeable and its relation towards it.
		var placedObject = tile.CTile.placedObjects[0];
		var relation = PlayersData.Relation.Neutral;
		var strongAgainstEnemy = false;
		if (placedObject) {
			relation = userData.playersData.getRelation(userData.player, placedObject.CPlayerData.player);

			if (relation == PlayersData.Relation.Enemy) {
				strongAgainstEnemy = UnitsUtils.isStrongVS(userData.placeable, placedObject);
				strongAgainstEnemy = strongAgainstEnemy && (userData.placeable.CUnit.health >= placedObject.CUnit.health);
			}
		}

		var visible = tile.CTileVisibility.visible;

		queryResult.cost = terrainStats.Cost;

		if (terrainStats.Attack * 0.5 + terrainStats.Defence > 0) queryResult.cost -= 1;
		if (terrainStats.Attack * 0.5 + terrainStats.Defence < 0) queryResult.cost += 1;
		if (queryResult.cost <= 0) queryResult.cost = 0.1;	// Fail-safe
			
		if (strongAgainstEnemy)	queryResult.cost += 0.5;

		// Avoid moving units in queues.
		if (relation == PlayersData.Relation.Ally)	queryResult.cost += 0.5;

		// Can't pass over enemies... unless it can't see them (for enemy preview ONLY).
		queryResult.passOver = relation != PlayersData.Relation.Enemy || strongAgainstEnemy || !visible;

		var bypassZoC = userData.placeable.CUnit.getDefinition().bypassZoneOfControl;

		if (!bypassZoC && queryResult.passOver && !userData.world.isStartTile(prevTile)) {
			if (!AIUtils.checkZoneOfControl(tile, userData) && AIUtils.checkZoneOfControl(prevTile, userData)) {
				queryResult.cost += 1;
			}
		}

		// Same...
		queryResult.discard = false;
	},

	findSafestTiles: function (unit, tiles, statName) {

		statName = statName || 'Defence';

		var bestTiles = [];
		var bestScore = -Infinity;

		for(var i = 0; i < tiles.length; ++i) {
			var tile = tiles[i];

			var terrainStats = unit.CStatistics.terrainStats[tile.CTileTerrain.type];
			if (terrainStats[statName] > bestScore) {
				bestTiles.clear();
				bestScore = terrainStats[statName];
			}

			if (terrainStats[statName] == bestScore)
				bestTiles.push(tile);
		}

		return bestTiles;
	},

	checkZoneOfControl: Actions.Classes.ActionMove.checkZoneOfControl,

}