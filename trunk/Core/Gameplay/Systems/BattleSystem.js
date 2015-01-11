//===============================================
// BattleSystem
// Does all the battle calculations and predictions.
//===============================================
"use strict";

var BattleSystem = function (m_world) {
	var self = this;

	this.initialize = function () {
		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADING, onGameLoading);
	}

	this.predictOutcome = function (attacker, defender) {

		if (Utils.assert(!!attacker.CStatistics.statistics['Attack'])) return;
		if (Utils.assert(!!defender.CStatistics.statistics['Defence'])) return;

		// Attacker parameters
		var aTile = attacker.CTilePlaceable.tile;
		var aTerrainMod = attacker.CStatistics.terrainStats[aTile.CTileTerrain.type].Attack || 0;
		var aRange = attacker.CStatistics.statistics['AttackRange'];
		var aHealthMod = attacker.CUnit.health / attacker.CStatistics.statistics['MaxHealth'];
		var aFirePower = attacker.CStatistics.statistics['FirePower'];
		var aStrength = (attacker.CStatistics.statistics['Attack'] + aTerrainMod) * aHealthMod;


		// Defender parameters
		var dTile = defender.CTilePlaceable.tile;
		var dTerrainMod = defender.CStatistics.terrainStats[dTile.CTileTerrain.type].Defence || 0;
		var dRange = defender.CStatistics.statistics['AttackRange'];
		var dHealthMod = defender.CUnit.health / defender.CStatistics.statistics['MaxHealth'];
		var dFirePower = defender.CStatistics.statistics['FirePower']
		var dStrength = (defender.CStatistics.statistics['Defence'] + dTerrainMod) * dHealthMod;


		// Common
		var distance = m_world.getDistance(aTile, dTile);


		// Battle!
		var strengthRatio = Math.max(aStrength, dStrength) / Math.min(aStrength, dStrength);

		var dInflictedDamage = (aStrength >= dStrength) ? aFirePower * strengthRatio : aFirePower / strengthRatio;
		var aInflictedDamage = (aStrength >= dStrength) ? dFirePower / strengthRatio : dFirePower * strengthRatio;

		// Check if actually in range.
		if (aRange < distance) dInflictedDamage = 0;
		if (dRange < distance) aInflictedDamage = 0;

		dInflictedDamage = Math.round(dInflictedDamage);
		aInflictedDamage = Math.round(aInflictedDamage);

		// If defender dies, attacker is considered lucky.
		if (defender.CUnit.health - dInflictedDamage <= 0 && attacker.CUnit.health - aInflictedDamage <= 0) {
			aInflictedDamage = attacker.CUnit.health - 1;
		}

		return {
			attacker: attacker,
			defender: defender,

			attackerTile: attacker.CTilePlaceable.tile,
			defenderTile: defender.CTilePlaceable.tile,

			attackerHealth: attacker.CUnit.health,
			defenderHealth: defender.CUnit.health,

			attackerStrength: aStrength,
			defenderStrength: dStrength,

			strengthRatio: strengthRatio,

			damageToAttacker: aInflictedDamage,
			damageToDefender: dInflictedDamage,

			attackerHealthOutcome: Math.max(0, attacker.CUnit.health - aInflictedDamage),
			defenderHealthOutcome: Math.max(0, defender.CUnit.health - dInflictedDamage),
		};
	}

	this.applyOutcome = function (battleOutcome) {
		
		battleOutcome.attacker.CUnit.health = battleOutcome.attackerHealthOutcome;
		battleOutcome.defender.CUnit.health = battleOutcome.defenderHealthOutcome;

		self._eworld.trigger(GameplayEvents.Units.UNIT_CHANGED, battleOutcome.attacker);
		self._eworld.trigger(GameplayEvents.Units.UNIT_CHANGED, battleOutcome.defender);
	}

	this.revertOutcome = function (battleOutcome) {
		battleOutcome.attacker.CUnit.health = battleOutcome.attackerHealth;
		battleOutcome.defender.CUnit.health = battleOutcome.defenderHealth;

		self._eworld.trigger(GameplayEvents.Units.UNIT_CHANGED, battleOutcome.attacker);
		self._eworld.trigger(GameplayEvents.Units.UNIT_CHANGED, battleOutcome.defender);

		m_world.place(battleOutcome.attacker, battleOutcome.attackerTile);
		m_world.place(battleOutcome.defender, battleOutcome.defenderTile);
	}

	this.doAttack = function (attacker, defender) {

		var battleOutcome = self.predictOutcome(attacker, defender);

		self.applyOutcome(battleOutcome);

		return battleOutcome;
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