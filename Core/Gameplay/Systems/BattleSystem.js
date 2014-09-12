//===============================================
// BattleSystem
// Does all the battle calculations and predictions.
//===============================================
"use strict";

var BattleSystem = function () {
	var self = this;

	this.initialize = function () {
		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADING, onGameLoading);
	}

	this.predictResults = function (attacker, defender) {

		// Attacker parameters
		var aTile = attacker.CTilePlaceable.tile;
		var aTerrainMod = attacker.CStatistics.terrainStats[aTile.CTileTerrain.type].Attack || 0;
		var aHealthMod = attacker.CUnit.health / attacker.CStatistics.statistics['MaxHealth'];
		var aFirePower = attacker.CStatistics.statistics['FirePower'];
		var aStrength = (attacker.CStatistics.statistics['Attack'] + aTerrainMod) * aHealthMod;


		// Defender parameters
		var dTile = defender.CTilePlaceable.tile;
		var dTerrainMod = defender.CStatistics.terrainStats[dTile.CTileTerrain.type].Defence || 0;
		var dHealthMod = defender.CUnit.health / defender.CStatistics.statistics['MaxHealth'];
		var dFirePower = defender.CStatistics.statistics['FirePower']
		var dStrength = (defender.CStatistics.statistics['Defence'] + dTerrainMod) * dHealthMod;


		// Battle!
		var strengthRatio = Math.max(aStrength, dStrength) / Math.min(aStrength, dStrength);

		var dInflictedDamage = (aStrength >= dStrength) ? aFirePower * strengthRatio : aFirePower / strengthRatio;
		var aInflictedDamage = (aStrength >= dStrength) ? dFirePower / strengthRatio : dFirePower * strengthRatio;

		dInflictedDamage = Math.round(dInflictedDamage);
		aInflictedDamage = Math.round(aInflictedDamage);

		// If defender dies, attacker is considered lucky.
		if (defender.CUnit.health - dInflictedDamage <= 0 && attacker.CUnit.health - aInflictedDamage <= 0) {
			aInflictedDamage = Math.max(attacker.CUnit.health - 1, 1);
		}

		return {
			attacker: attacker,
			defender: defender,

			attackerStrength: aStrength,
			defenderStrength: dStrength,

			strengthRatio: strengthRatio,

			damageToAttacker: aInflictedDamage,
			damageToDefender: dInflictedDamage,
		};
	}

	this.doAttack = function (attacker, defender) {

		var battleResults = self.predictResults(attacker, defender);

		attacker.CUnit.health -= battleResults.damageToAttacker;
		defender.CUnit.health -= battleResults.damageToDefender;

		self._eworld.trigger(GameplayEvents.Units.UNIT_CHANGED, attacker);
		self._eworld.trigger(GameplayEvents.Units.UNIT_CHANGED, defender);

		return battleResults;
	}

	//
	// ---- Private ----
	//

	var m_gameState = null;
	var m_playersData = null;

	var onGameLoading = function (event) {
		m_gameState = self._eworld.extract(GameState);
		m_playersData = self._eworld.extract(PlayersData);
	}
};

ECS.EntityManager.registerSystem('BattleSystem', BattleSystem);
SystemsUtils.supplySubscriber(BattleSystem, [CTilePlaceable]);