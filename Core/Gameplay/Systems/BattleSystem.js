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

	// Can also predict if attacker/defender were placed on a specific tiles.
	this.predictOutcome = function (attacker, defender, opt_ignoreRanges, opt_attackerTile, opt_defenderTile) {

		if (Utils.assert(UnitsUtils.canAttackType(attacker, defender))) return null;
		if (Utils.assert(!!defender.CStatistics.statistics['Defence'])) return null;

		// Attacker parameters
		var aTile = opt_attackerTile || attacker.CTilePlaceable.tile;
		var aTerrainMod = attacker.CStatistics.terrainStats[aTile.CTileTerrain.type].Attack || 0;
		var aRangeMin = attacker.CStatistics.statistics['AttackRangeMin'] || 0;
		var aRange = attacker.CStatistics.statistics['AttackRange'];
		var aHealthMod = attacker.CUnit.health / attacker.CStatistics.statistics['MaxHealth'];
		var aFirePower = attacker.CStatistics.statistics['FirePower'];
		var aAttack = UnitsUtils.getAttack(attacker, defender);
		aAttack = (aAttack + aTerrainMod) * attacker.CStatistics.statistics['AttackMultiplier'];
		var aStrength = aAttack* aHealthMod;


		// Defender parameters
		var dTile = opt_defenderTile || defender.CTilePlaceable.tile;
		var dTerrainMod = defender.CStatistics.terrainStats[dTile.CTileTerrain.type].Defence || 0;
		var dRangeMin = defender.CStatistics.statistics['AttackRangeMin'];
		var dRange = defender.CStatistics.statistics['AttackRange'];
		var dHealthMod = defender.CUnit.health / defender.CStatistics.statistics['MaxHealth'];
		var dFirePower = defender.CStatistics.statistics['FirePower'];
		var dStrength = (defender.CStatistics.statistics['Defence'] + dTerrainMod) * dHealthMod;


		// Common
		var distance = m_world.getDistance(aTile, dTile);
		var canDefenderFightBack = UnitsUtils.canAttackType(defender, attacker);


		// Battle!
		var strengthRatio = Math.max(aStrength, dStrength) / Math.min(aStrength, dStrength);

		var dInflictedDamage = (aStrength >= dStrength) ? aFirePower * strengthRatio : aFirePower / strengthRatio;
		var aInflictedDamage = (aStrength >= dStrength) ? dFirePower / strengthRatio : dFirePower * strengthRatio;

		// Check if actually in range.
		if (!opt_ignoreRanges) {

			if (Utils.assert(aRangeMin <= distance && distance <= aRange)) return null;

			if (distance < dRangeMin || dRange < distance) canDefenderFightBack = false;
		}
		
		if (!canDefenderFightBack)
			aInflictedDamage = 0;

		
		dInflictedDamage = Math.round(dInflictedDamage);
		aInflictedDamage = Math.round(aInflictedDamage);

		// If defender dies, attacker is considered lucky.
		if (defender.CUnit.health - dInflictedDamage <= 0 && attacker.CUnit.health - aInflictedDamage <= 0) {
			aInflictedDamage = attacker.CUnit.health - 1;
		}

		return {
			attacker: attacker,
			defender: defender,

			attackerTile: aTile,
			defenderTile: dTile,

			attackerHealth: attacker.CUnit.health,
			defenderHealth: defender.CUnit.health,

			attackerStrength: aStrength,
			defenderStrength: dStrength,

			strengthRatio: strengthRatio,

			damageToAttacker: aInflictedDamage,
			damageToDefender: dInflictedDamage,

			attackerHealthOutcome: Math.max(0, attacker.CUnit.health - aInflictedDamage),
			defenderHealthOutcome: Math.max(0, defender.CUnit.health - dInflictedDamage),

			defenderFightsBack: canDefenderFightBack,
		};
	}

	this.applyOutcome = function (battleOutcome) {
		
		if (Utils.assert(battleOutcome.attackerTile == battleOutcome.attacker.CTilePlaceable.tile, 'Attacker is on different tile.'))
			return;
		if (Utils.assert(battleOutcome.defenderTile == battleOutcome.defender.CTilePlaceable.tile, 'Defender is on different tile.'))
			return;

		battleOutcome.attacker.CUnit.health = battleOutcome.attackerHealthOutcome;
		battleOutcome.defender.CUnit.health = battleOutcome.defenderHealthOutcome;

		self._eworld.trigger(GameplayEvents.Units.UNIT_CHANGED, battleOutcome.attacker);
		self._eworld.trigger(GameplayEvents.Units.UNIT_CHANGED, battleOutcome.defender);
	}

	this.revertOutcome = function (battleOutcome) {
		if (Utils.assert(battleOutcome.attackerTile == battleOutcome.attacker.CTilePlaceable.tile, 'Attacker is on different tile.'))
			return;
		if (Utils.assert(battleOutcome.defenderTile == battleOutcome.defender.CTilePlaceable.tile, 'Defender is on different tile.'))
			return;

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

	var onGameLoading = function () {
		m_gameState = self._eworld.extract(GameState);
		m_playersData = self._eworld.extract(PlayersData);
	}
};

ECS.EntityManager.registerSystem('BattleSystem', BattleSystem);
SystemsUtils.supplySubscriber(BattleSystem, [CTilePlaceable]);