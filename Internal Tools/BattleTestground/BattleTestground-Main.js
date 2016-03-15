// BattleTestground Main entry point
"use strict";

$(function () {
	
	var store = new Persist.Store('BattleTester');

	var storeValue = function ($el) {
		store.set($el.attr('id'), $el.val());
	}

	var fetchValue = function ($el, applyHandler) {
		var val = store.get($el.attr('id'));

		if (val !== undefined) {
			applyHandler(val);
		}
	};

	var restoreValue = function ($el, suppressChange, applyHandler) {
		var val = store.get($el.attr('id'));
		
		if (val !== undefined) {
			$el.val(val);
			if (!suppressChange) $el.change();
			if (applyHandler)
				applyHandler(null, val);
		}
	}



	var appendStat = function (val) {
		if (val > 0)
			return ' + ' + val;
		if (val == 0)
			return '';
		if (val < 0) {
			return ' - ' + Math.abs(val);
		}
	};

	var pretify = function (str, className) {
		return (str) ? '<span class="' + className + '">' + str + '</span>' : '';
	}

	
	var attacker = null;
	var defender = null;

	var attackerDefinition = null;
	var defenderDefinition = null;

	var attackerTiles = [];
	var defenderTiles = [];
	var genericTiles = [];

	var attackerTile = null;
	var defenderTile = null;

	var attackerPlayer = null;
	var defenderPlayer = null;
	var genericPlayers = [];

	var attackerModAttack = 0;
	var defenderModAttack = 0;
	var attackerModDefence = 0;
	var defenderModDefence = 0;

	var refreshConfiguration = function () {
		
		if (attacker) attacker.destroy();
		if (defender) defender.destroy();

		rebuildGameData();

		attackerDefinition = UnitsFactory.resolveDefinitionPath($attackerList.val());
		defenderDefinition = UnitsFactory.resolveDefinitionPath($defenderList.val());

		attacker = UnitsFactory.createUnit(attackerDefinition, attackerPlayer);
		defender = UnitsFactory.createUnit(defenderDefinition, defenderPlayer);
		storeValue($attackerList);
		storeValue($defenderList);
		
		rebuildTerrainLists();

		m_eworld.addUnmanagedEntity(attacker);
		m_eworld.addUnmanagedEntity(defender);
		onAttackerTerrainChange(null, true);
		onDefenderTerrainChange(null, true);

		onAttackerHealth(null);
		onDefenderHealth(null);

		renderUnitStatistics();
		renderUnitTerrainStatistics();
	}

	// Reset players according to selected units (i.e. select correct races).
	var rebuildGameData = function () {

		if (m_playersData) Utils.invalidate(m_playersData);
		if (m_gameState) Utils.invalidate(m_gameState);

		// Initialize new data
		m_playersData = m_eworld.store(PlayersData, new PlayersData(m_eworld));
		attackerPlayer = m_playersData.addPlayer('Pl1', Player.Types.Human, UnitsFactory.resolveDefinitionPathRace($attackerList.val()));
		defenderPlayer = m_playersData.addPlayer('Pl2', Player.Types.Human, UnitsFactory.resolveDefinitionPathRace($defenderList.val()));
		genericPlayers[Player.Races.Empire] = m_playersData.addPlayer('GenericEmpire', Player.Types.Human, Player.Races.Empire);
		genericPlayers[Player.Races.Roaches] = m_playersData.addPlayer('GenericRoaches', Player.Types.Human, Player.Races.Roaches);
		genericPlayers[Player.Races.JunkPeople] = m_playersData.addPlayer('GenericJunkPeople', Player.Types.Human, Player.Races.JunkPeople);

		m_gameState = m_eworld.store(GameState, new GameState());

		m_eworld.triggerAsync(EngineEvents.General.GAME_LOADING);

		m_eworld.triggerAsync(EngineEvents.General.GAME_LOADED);
	}

	var rebuildTerrainLists = function () {
		$attackerTerrainList.empty();
		$defenderTerrainList.empty();

		var prevAttackerTileType = (attackerTile) ? attackerTile.CTileTerrain.type : GameWorldTerrainType.None;
		var prevDefenderTileType = (defenderTile) ? defenderTile.CTileTerrain.type : GameWorldTerrainType.None;

		for (var terrainTypeName in GameWorldTerrainType) {
			var terrainType = GameWorldTerrainType[terrainTypeName];
			
			// Add terrain type only if valid for this unit. Keep selection if possible.
			if (attacker.CStatistics.terrainStats[terrainType]) {
				$('<option />').attr("value", terrainTypeName).text(terrainTypeName).appendTo($attackerTerrainList)
				.prop('selected', terrainType == prevAttackerTileType );
			}

			if (defender.CStatistics.terrainStats[terrainType]) {
				$('<option />').attr("value", terrainTypeName).text(terrainTypeName).appendTo($defenderTerrainList)
				.prop('selected', terrainType == prevDefenderTileType );
			}
		}
	}

	var predictOutcome = function () {
		
		setActionsError();

		if (attacker.CUnit.health == 0 || defender.CUnit.health == 0) {
			return;
		}

		if (!UnitsUtils.canAttackType(attacker, defenderDefinition.type)) {
			setActionsError('Attacker can\'t attack defender\'s type.');
			return;
		}


		var outcome = m_battle.predictOutcome(attacker, defender, true);


		//
		// Health predicted
		//

		$attackerHealthPredicted.val(outcome.attackerHealthOutcome);
		$lbAttackerHealthPredicted.text(outcome.attackerHealthOutcome);
		$lbAttackerHealthPredicted.removeClass('no_health');
		$lbAttackerHealthPredicted.removeClass('low_health');

		if (outcome.attackerHealthOutcome == 0) {
			$lbAttackerHealthPredicted.addClass('no_health');
		} else if (outcome.attackerHealthOutcome <= 4) {
			$lbAttackerHealthPredicted.addClass('low_health');
		}



		$defenderHealthPredicted.val(outcome.defenderHealthOutcome);
		$lbDefenderHealthPredicted.text(outcome.defenderHealthOutcome);
		$lbDefenderHealthPredicted.removeClass('no_health');
		$lbDefenderHealthPredicted.removeClass('low_health');

		if (outcome.defenderHealthOutcome == 0) {
			$lbDefenderHealthPredicted.addClass('no_health');
		} else if (outcome.defenderHealthOutcome <= 4) {
			$lbDefenderHealthPredicted.addClass('low_health');
		}



		//
		// Strengths predicted
		//
		$attackerStrengthPredicted.val(outcome.attackerStrength);
		$lbAttackerStrengthPredicted.text(outcome.attackerStrength.toPrecision(2));

		$defenderStrengthPredicted.val(outcome.defenderStrength);
		$lbDefenderStrengthPredicted.text(outcome.defenderStrength.toPrecision(2));
		$lbDefenderStrengthSecondaryPredicted.text(outcome.defenderStrengthSecondary.toPrecision(2));

		$lbStrengthPredictedRatio.text(outcome.strengthRatio.toPrecision(2));
	}

	var renderUnitStatistics = function () {
		$unitStatisticsTableBody.empty();
		var stats = {};

		// Special stats go first (sorting)
		stats['Attack'] = [];
		stats['Defence'] = [];
		if ($cbShowDetails.is(':checked')) stats['AttackRange'] = [];
		stats['Movement'] = [];


		for(var statName in attacker.CStatistics.baseStatistics) {
			if ($cbShowDetails.is(':checked') || stats[statName]) {
				stats[statName] = stats[statName] || [];
				stats[statName][0] = attacker.CStatistics.baseStatistics[statName];
			}
		}
		stats['Attack'][0] = UnitsUtils.getAttackBase(attacker, defenderDefinition.type);


		for (var statName in defender.CStatistics.baseStatistics) {
			if ($cbShowDetails.is(':checked') || stats[statName]) {
				stats[statName] = stats[statName] || [];
				stats[statName][1] = defender.CStatistics.baseStatistics[statName];
			}
		}
		stats['Attack'][1] = UnitsUtils.getAttackBase(defender, attackerDefinition.type);


		//
		// Some default parameters
		//
		$('<tr> ' +
				'<td>' + attackerDefinition.price + '</td>' +
				'<td>' + 'Price' + '</td>' +
				'<td>' + defenderDefinition.price + '</td>' +
			'</tr>'
		).appendTo($unitStatisticsTableBody);

		$('<tr> ' +
				'<td>' + pretify(Enums.getName(UnitType, attackerDefinition.type), 'stat_unit_type_' + attackerDefinition.type) + '</td>' +
				'<td>' + 'Type' + '</td>' +
				'<td>' + pretify(Enums.getName(UnitType, defenderDefinition.type), 'stat_unit_type_' + defenderDefinition.type) + '</td>' +
			'</tr>'
		).appendTo($unitStatisticsTableBody);

		

		var aTerrain = attacker.CStatistics.terrainStats[attackerTile.CTileTerrain.type];
		var dTerrain = defender.CStatistics.terrainStats[defenderTile.CTileTerrain.type];

		// All the unit stats
		for(var statName in stats) {
			var vals = stats[statName];
			var aval = vals[0] || 0;
			var dval = vals[1] || 0;


			// Combine with terrain
			if (statName == 'Attack') {
				aval += aTerrain.Attack + attackerModAttack;
				dval += dTerrain.Attack + defenderModAttack;

				vals[0] += pretify(appendStat(aTerrain.Attack), 'stat_terrain_value');
				vals[1] += pretify(appendStat(dTerrain.Attack), 'stat_terrain_value');

				vals[0] += pretify(appendStat(attackerModAttack), 'stat_mod_value');
				vals[1] += pretify(appendStat(defenderModAttack), 'stat_mod_value');

				// Not only number, show sum
				if (vals[0].indexOf(' ') != -1) vals[0] += ' = ' + aval;
				if (vals[1].indexOf(' ') != -1) vals[1] += ' = ' + dval;

				// HACK: If unit can't attack, for pretty code, recognize if the string has undefined.
				if (vals[0].indexOf('undefined') != -1) vals[0] = '-';
				if (vals[1].indexOf('undefined') != -1) vals[1] = '-';
			}
			if (statName == 'Defence') {
				aval += aTerrain.Defence + attackerModDefence;
				dval += dTerrain.Defence + defenderModDefence;

				vals[0] += pretify(appendStat(aTerrain.Defence), 'stat_terrain_value');
				vals[1] += pretify(appendStat(dTerrain.Defence), 'stat_terrain_value');

				vals[0] += pretify(appendStat(attackerModDefence), 'stat_mod_value');
				vals[1] += pretify(appendStat(defenderModDefence), 'stat_mod_value');

				// Not only number, show sum
				if (vals[0].indexOf(' ') != -1) vals[0] += ' = ' + aval;
				if (vals[1].indexOf(' ') != -1) vals[1] += ' = ' + dval;
			}
			if (statName == 'Movement') {
				aval -= aTerrain.Cost;
				dval -= dTerrain.Cost;
				vals[0] += ' / ' + aTerrain.Cost;
				vals[1] += ' / ' + dTerrain.Cost;
			}

			
			var $tr = $('<tr />').appendTo($unitStatisticsTableBody);

			$('<td />')
			.html((vals[0] || ' - '))
			.addClass(   ( aval > dval ) ? 'stat_better' : '' )
			.appendTo($tr);

			$('<td />')
			.html(statName)
			.appendTo($tr);
			
			$('<td />')
			.html(vals[1] || ' - ')
			.addClass(   ( aval < dval ) ? 'stat_better' : '' )
			.appendTo($tr);
		}

		// Modify statistics
		// NOTE: Rendering base statistics, so modifier can be applied to real statistics.
		//		 If effects are added, will have to be drawn separately ' + 3'.
		attacker.CStatistics.statistics[UnitTypeStatNames[defenderDefinition.type]] = UnitsUtils.getAttackBase(attacker, defenderDefinition.type) + attackerModAttack;
		defender.CStatistics.statistics[UnitTypeStatNames[attackerDefinition.type]] = UnitsUtils.getAttackBase(defender, attackerDefinition.type) + defenderModAttack;
		attacker.CStatistics.statistics['Defence'] = attacker.CStatistics.baseStatistics['Defence'] + attackerModDefence;
		defender.CStatistics.statistics['Defence'] = defender.CStatistics.baseStatistics['Defence'] + defenderModDefence;

		predictOutcome();
	}

	var renderUnitTerrainStatistics = function () {
		$unitTerrainStatisticsTableBody.empty();
		var stats = {};

		for (var statType in attacker.CStatistics.terrainStats) {
			var statName = Enums.getName(GameWorldTerrainType, statType);
			stats[statName] = stats[statName] || [];
			stats[statName][0] = attacker.CStatistics.terrainStats[statType];
		}

		for (var statType in defender.CStatistics.terrainStats) {
			var statName = Enums.getName(GameWorldTerrainType, statType);
			stats[statName] = stats[statName] || [];
			stats[statName][1] = defender.CStatistics.terrainStats[statType];
		}

		// All the unit stats
		for (var statName in stats) {
			var vals = stats[statName];
			var aval = vals[0] || { Cost: 9999, Attack: 0, Defence: 0 };
			var dval = vals[1] || { Cost: 9999, Attack: 0, Defence: 0 };

			var $tr = $('<tr />').appendTo($unitTerrainStatisticsTableBody);

			if (vals[0]) {
				$('<td />')
				.text( aval.Defence )
				.addClass( ( aval.Defence > dval.Defence ) ? 'stat_better' : '' )
				.appendTo($tr);
				$('<td />')
				.text( aval.Attack )
				.addClass( ( aval.Attack > dval.Attack ) ? 'stat_better' : '' )
				.appendTo($tr);
				$('<td />')
				.text( aval.Cost )
				.addClass( ( aval.Cost < dval.Cost ) ? 'stat_better' : '' )
				.appendTo($tr);
			} else {
				$('<td>-</td><td>-</td><td>-</td>').appendTo($tr);
			}


			$('<td />')
			.text(statName)
			.appendTo($tr);


			if (vals[1]) {
				$('<td />')
				.text( dval.Cost )
				.addClass( ( aval.Cost > dval.Cost ) ? 'stat_better' : '' )
				.appendTo($tr);
				$('<td />')
				.text( dval.Attack )
				.addClass( ( aval.Attack < dval.Attack ) ? 'stat_better' : '' )
				.appendTo($tr);
				$('<td />')
				.text( dval.Defence )
				.addClass( ( aval.Defence < dval.Defence ) ? 'stat_better' : '' )
				.appendTo($tr);
			} else {
				$('<td>-</td><td>-</td><td>-</td>').appendTo($tr);
			}
		}
	}
	



	var onAttackerHealth = function (event) {
		$lbAttackerHealth.text($attackerHealth.val());
		attacker.CUnit.health = parseInt($attackerHealth.val());

		$lbAttackerHealth.removeClass('no_health');
		$lbAttackerHealth.removeClass('low_health');

		if (attacker.CUnit.health == 0) {
			$lbAttackerHealth.addClass('no_health');
		} else if (attacker.CUnit.health <= 4) {
			$lbAttackerHealth.addClass('low_health');
		}

		storeValue($attackerHealth);

		predictOutcome();
	}

	var onDefenderHealth = function (event) {
		$lbDefenderHealth.text($defenderHealth.val());
		defender.CUnit.health = parseInt($defenderHealth.val());

		$lbDefenderHealth.removeClass('no_health');
		$lbDefenderHealth.removeClass('low_health');

		if (defender.CUnit.health == 0) {
			$lbDefenderHealth.addClass('no_health');
		} else if (defender.CUnit.health <= 4) {
			$lbDefenderHealth.addClass('low_health');
		}

		storeValue($defenderHealth);

		predictOutcome();
	}


	var onAttackerModAttack = function (event) {
		$lbAttackerModAttack.text($attackerModAttack.val());
		attackerModAttack = parseInt($attackerModAttack.val());

		storeValue($attackerModAttack);

		renderUnitStatistics();
	}

	var onDefenderModAttack = function (event) {
		$lbDefenderModAttack.text($defenderModAttack.val());
		defenderModAttack = parseInt($defenderModAttack.val());

		storeValue($defenderModAttack);

		renderUnitStatistics();
	}


	var onAttackerModDefence = function (event) {
		$lbAttackerModDefence.text($attackerModDefence.val());
		attackerModDefence = parseInt($attackerModDefence.val());

		storeValue($attackerModDefence);

		renderUnitStatistics();
	}

	var onDefenderModDefence = function (event) {
		$lbDefenderModDefence.text($defenderModDefence.val());
		defenderModDefence = parseInt($defenderModDefence.val());

		storeValue($defenderModDefence);

		renderUnitStatistics();
	}




	var onAttackerTerrainChange = function (event, suppressRenderStatistics) {
		attackerTile = attackerTiles[GameWorldTerrainType[$attackerTerrainList.val()]];
		m_world.place(attacker, attackerTile);

		storeValue($attackerTerrainList);

		if (attackerTile != null && defenderTile != null && !suppressRenderStatistics)
			renderUnitStatistics();
	}

	var onDefenderTerrainChange = function (event, suppressRenderStatistics) {
		defenderTile = defenderTiles[GameWorldTerrainType[$defenderTerrainList.val()]];
		m_world.place(defender, defenderTile);
		
		storeValue($defenderTerrainList);

		if (attackerTile != null && defenderTile != null && !suppressRenderStatistics)
			renderUnitStatistics();
	}

	var onAttackModReset = function (event) {
		$attackerModAttack.val(0);
		$defenderModAttack.val(0);

		onAttackerModAttack(null);
		onDefenderModAttack(null);
	}

	var onDefenceModReset = function (event) {
		$attackerModDefence.val(0);
		$defenderModDefence.val(0);

		onAttackerModDefence(null);
		onDefenderModDefence(null);
	}

	var onHealthReset = function (event) {
		$attackerHealth.val(attacker.CStatistics.baseStatistics['MaxHealth']);
		$defenderHealth.val(defender.CStatistics.baseStatistics['MaxHealth']);

		onAttackerHealth(null);
		onDefenderHealth(null);
	}

	var onSwapParticipants = function (event) {
		var attackerVal = $attackerList.val();
		var defenderVal = $defenderList.val();
		$('#AttackerList option[selected]').removeAttr('selected');
		$('#DefenderList option[selected]').removeAttr('selected');

		$('#AttackerList option[value="'+ defenderVal + '"]').attr('selected', 'selected');
		$('#DefenderList option[value="' + attackerVal + '"]').attr('selected', 'selected');

		var tile = attackerTile;
		attackerTile = defenderTile;
		defenderTile = tile;

		var val = $attackerHealth.val();
		$attackerHealth.val($defenderHealth.val());
		$defenderHealth.val(val);

		val = $attackerModAttack.val();
		$attackerModAttack.val($defenderModAttack.val());
		$defenderModAttack.val(val);

		val = $attackerModDefence.val();
		$attackerModDefence.val($defenderModDefence.val());
		$defenderModDefence.val(val);

		refreshConfiguration();

		$attackerModAttack.change();
		$defenderModAttack.change();
		$attackerModDefence.change();
		$defenderModDefence.change();
	}



	//
	// Battle simulations
	//
	var renderBattleOutcome = function (outcome) {
		var $tr = $('<tr />').appendTo($battleOutcomeTableBody);

		var restoreData = {};

		$('<td />')
		.text(outcome.attacker.CUnit.name + ' (' + Enums.getName(GameWorldTerrainType, outcome.attackerTile.CTileTerrain.type) + ')')
		.appendTo($tr);
		restoreData.attackerPath = UnitsFactory.generateDefinitionPath(outcome.attacker.CUnit.name);
		restoreData.attackerTerrain = Enums.getName(GameWorldTerrainType, outcome.attackerTile.CTileTerrain.type);

		$('<td />')
		.text(outcome.defender.CUnit.name + ' (' + Enums.getName(GameWorldTerrainType, outcome.defenderTile.CTileTerrain.type) + ')')
		.appendTo($tr);
		restoreData.defenderPath = UnitsFactory.generateDefinitionPath(outcome.defender.CUnit.name);
		restoreData.defenderTerrain = Enums.getName(GameWorldTerrainType, outcome.defenderTile.CTileTerrain.type);

		$('<td />')
		.text(UnitsUtils.getAttack(outcome.attacker, defenderDefinition.type))
		.appendTo($tr);
		restoreData.attackerModAttack = $attackerModAttack.val();
		restoreData.attackerModDefence = $attackerModDefence.val();

		$('<td />')
		.text(outcome.defender.CStatistics.statistics['Defence'])
		.appendTo($tr);
		restoreData.defenderModAttack = $defenderModAttack.val();
		restoreData.defenderModDefence = $defenderModDefence.val();

		$('<td />')
		.text(outcome.attackerHealth + ' | ' + outcome.defenderHealth)
		.appendTo($tr);
		restoreData.attackerHealth = outcome.attackerHealth;
		restoreData.defenderHealth = outcome.defenderHealth;

		$('<td />')
		.text(outcome.attackerHealthOutcome + ' | ' + outcome.defenderHealthOutcome)
		.appendTo($tr);
		restoreData.attackerHealthOutcome = outcome.attackerHealthOutcome;
		restoreData.defenderHealthOutcome = outcome.defenderHealthOutcome;

		$('<td />')
		.text(outcome.attackerStrength.toPrecision(2) + ' | ' + outcome.defenderStrength.toPrecision(2) + ' @ ' + outcome.strengthRatio.toPrecision(2))
		.appendTo($tr);

		var $td = $('<td />')
		.appendTo($tr);
		$('<a />')
		.text('R')
		.appendTo($td)
		.click(function () {

			$attackerHealth.val(restoreData.attackerHealth);
			$defenderHealth.val(restoreData.defenderHealth);

			$('#AttackerList option[selected]').removeAttr('selected');
			$('#DefenderList option[selected]').removeAttr('selected');

			$('#AttackerList option[value="' + restoreData.attackerPath + '"]').attr('selected', 'selected');
			$('#DefenderList option[value="' + restoreData.defenderPath + '"]').attr('selected', 'selected');

			$attackerModAttack.val(restoreData.attackerModAttack);
			$defenderModAttack.val(restoreData.defenderModAttack);

			$attackerModDefence.val(restoreData.attackerModDefence);
			$defenderModDefence.val(restoreData.defenderModDefence);

			refreshConfiguration();

			// HACK: WORKS BY PURE MAGIC!
			//		 Because selects set value only by 'select' attribute! Refresh later rebuilds the select!
			setTimeout(function () {
				$attackerTerrainList.val(restoreData.attackerTerrain);
				$attackerTerrainList.change();

				$defenderTerrainList.val(restoreData.defenderTerrain);
				$defenderTerrainList.change();

				refreshConfiguration();
			}, 1)
		});

		var $td = $('<td />')
		.appendTo($tr);
		$('<a />')
		.text('X')
		.appendTo($td)
		.click(function () {
			$tr.remove();
		});
	}

	var renderSeparator = function (label) {
		var $tr = $('<tr />').appendTo($battleOutcomeTableBody);

		var $td = $('<td />')
		.attr('colspan', 9)
		.addClass('separator')
		.appendTo($tr);


		$('<hr />')
		.addClass('left')
		.appendTo($td);

		$('<a />')
		.text(label)
		.appendTo($td)
		.click(function (event) {
			$tr.remove();
		});

		$('<hr />')
		.addClass('right')
		.appendTo($td);
	}

	var onPredict = function (event) {

		if (attacker.CUnit.health == 0 || defender.CUnit.health == 0) {
			alert('Both unit must have some health.');
			return;
		}

		if (!UnitsUtils.canAttackType(attacker, defenderDefinition.type)) {
			alert('Attacker can\'t attack defender\'s type.');
			return;
		}

		var outcome = m_battle.predictOutcome(attacker, defender, true);

		renderBattleOutcome(outcome);
	}

	var onFight = function (event) {
		if (attacker.CUnit.health == 0 || defender.CUnit.health == 0) {
			alert('Both unit must have some health.');
			return;
		}

		if (!UnitsUtils.canAttackType(attacker, defenderDefinition.type)) {
			alert('Attacker can\'t attack defender\'s type.');
			return;
		}

		var outcome = m_battle.doAttack(attacker, defender);

		renderBattleOutcome(outcome);

		$attackerHealth.val(attacker.CUnit.health);
		$attackerHealth.change();

		$defenderHealth.val(defender.CUnit.health);
		$defenderHealth.change();
	}

	var onFightBack = function (event) {
		if (attacker.CUnit.health == 0 || defender.CUnit.health == 0) {
			alert('Both unit must have some health.');
			return;
		}

		if (!UnitsUtils.canAttackType(attacker, defenderDefinition.type)) {
			alert('Defender can\'t attack attackers\'s type.');
			return;
		}

		var outcome = m_battle.doAttack(defender, attacker);

		renderBattleOutcome(outcome);

		$attackerHealth.val(attacker.CUnit.health);
		$attackerHealth.change();

		$defenderHealth.val(defender.CUnit.health);
		$defenderHealth.change();
	}

	var onPredictAll = function (event) {
		if (attacker.CUnit.health == 0) {
			alert('The attacker must have some health.');
			return;
		}

		for (var i = 0; i < UnitsDefinitions.length; ++i) {
			
			// Don't show races that are not interesting (developers race).
			if (!genericPlayers[i])
				continue;

			renderSeparator(Enums.getName(Player.Races, i));

			for (var key in UnitsDefinitions[i]) {
				var definition = UnitsDefinitions[i][key];

				if (!UnitsUtils.canAttackType(attacker, definition.type)) {
					continue;
				}
				
				var genericUnit = UnitsFactory.createUnit(definition, genericPlayers[i]);
				genericUnit.CUnit.health = defender.CUnit.health;

				m_eworld.addUnmanagedEntity(genericUnit);
				
				// Check if can place generic unit on the same tile as defender.
				if (genericUnit.CStatistics.terrainStats[GameWorldTerrainType[$defenderTerrainList.val()]]) {
					m_world.place(genericUnit, genericTiles[GameWorldTerrainType[$defenderTerrainList.val()]]);
				} else {
					m_world.place(genericUnit, genericTiles[GameWorldTerrainType.Plains]);
				}

				var outcome = m_battle.predictOutcome(attacker, genericUnit, true);
				renderBattleOutcome(outcome);

				genericUnit.destroy();
			}
		}
	}

	var onSeparator = function (event) {
		renderSeparator('Separator');
	}

	var onClear = function () {
		$battleOutcomeTableBody.empty();
	}

	var setActionsError = function (message) {
		if (message) {
			$battleActionsPanel.hide();
			$battleActionsError.show();	
			
			$battleActionsError.text(message);
		} else {
			$battleActionsPanel.show();
			$battleActionsError.hide();
		}
	}

	//
	// Initialize
	//
	var initializeParticipantLists = function () {
		
		for (var i = 0; i < UnitsDefinitions.length; ++i) {
			
			$('<option />').attr('disabled','disabled').text('> ' + Enums.getName(Player.Races, i) + ' <').appendTo($attackerList);
			$('<option />').attr('disabled','disabled').text('> ' + Enums.getName(Player.Races, i) + ' <').appendTo($defenderList);

			for (var key in UnitsDefinitions[i]) {
				var definition = UnitsDefinitions[i][key];
				var definitionPath = UnitsFactory.generateDefinitionPath(i, definition);
				
				$('<option />').attr("value", definitionPath).text(definition.name).appendTo($attackerList);
				$('<option />').attr("value", definitionPath).text(definition.name).appendTo($defenderList);
			}
		}
	}

	var initializeTiles = function () {
		var row = 0;
		var column = 0;

		for (var terrainTypeName in GameWorldTerrainType) {
			
			var terrainType = GameWorldTerrainType[terrainTypeName];
			
			if (terrainType == GameWorldTerrainType.None)
				continue;

			var tileAttacker = GameWorld.createTileUnmanaged(terrainType, 0, column);
			var tileDefender = GameWorld.createTileUnmanaged(terrainType, 1, column);
			var tileGeneric = GameWorld.createTileUnmanaged(terrainType, 2, column);

			attackerTiles[terrainType] = tileAttacker;
			defenderTiles[terrainType] = tileDefender;
			genericTiles[terrainType] = tileGeneric;

			m_eworld.addUnmanagedEntity(tileAttacker);
			m_eworld.addUnmanagedEntity(tileDefender);
			m_eworld.addUnmanagedEntity(tileGeneric);

			column++;
		}
	}

	var restoreValues = function () {
		var attackerTerrainListVal;
		var defenderTerrainListVal;

		fetchValue($attackerTerrainList, function (val) {
			attackerTerrainListVal = val;
		});
		fetchValue($defenderTerrainList, function (val) {
			defenderTerrainListVal = val;
		});
		
		restoreValue($attackerHealth,true);
		restoreValue($defenderHealth, true);

		restoreValue($attackerList, true);
		restoreValue($defenderList);


		restoreValue($attackerModAttack);
		restoreValue($defenderModAttack);
		restoreValue($attackerModDefence);
		restoreValue($defenderModDefence);

		// HACK: WORKS BY PURE MAGIC!
		//		 Because selects set value only by 'select' attribute! Refresh later rebuilds the select!
		setTimeout(function () {
			$attackerTerrainList.val(attackerTerrainListVal);
			$attackerTerrainList.change();

			$defenderTerrainList.val(defenderTerrainListVal);
			$defenderTerrainList.change();
		}, 1)
	}

	var $attackerList = $('#AttackerList');
	var $defenderList = $('#DefenderList');

	var $attackerTerrainList = $('#AttackerTerrainList');
	var $defenderTerrainList = $('#DefenderTerrainList');

	var $attackerModAttack = $('#AttackerModAttack');
	var $defenderModAttack = $('#DefenderModAttack');
	var $lbAttackerModAttack = $('#AttackerModAttackLabel');
	var $lbDefenderModAttack = $('#DefenderModAttackLabel');

	var $attackerModDefence = $('#AttackerModDefence');
	var $defenderModDefence = $('#DefenderModDefence');
	var $lbAttackerModDefence = $('#AttackerModDefenceLabel');
	var $lbDefenderModDefence = $('#DefenderModDefenceLabel');

	var $attackerHealth = $('#AttackerHealth');
	var $defenderHealth = $('#DefenderHealth');
	var $lbAttackerHealth = $('#AttackerHealthLabel');
	var $lbDefenderHealth = $('#DefenderHealthLabel');

	var $attackerHealthPredicted = $('#AttackerHealthPredicted');
	var $defenderHealthPredicted = $('#DefenderHealthPredicted');
	var $lbAttackerHealthPredicted = $('#AttackerHealthPredictedLabel');
	var $lbDefenderHealthPredicted = $('#DefenderHealthPredictedLabel');

	var $attackerStrengthPredicted = $('#AttackerStrengthPredicted');
	var $defenderStrengthPredicted = $('#DefenderStrengthPredicted');
	var $lbAttackerStrengthPredicted = $('#AttackerStrengthPredictedLabel');
	var $lbDefenderStrengthPredicted = $('#DefenderStrengthPredictedLabel');
	var $lbDefenderStrengthSecondaryPredicted = $('#DefenderStrengthSecondaryPredictedLabel');
	var $lbStrengthPredictedRatio = $('#StrengthPredictedRatio');

	var $unitStatisticsTableBody = $('#UnitStatistics > tbody');
	var $unitTerrainStatisticsTableBody = $('#UnitTerrainStatistics > tbody');


	var $battleOutcomeTableBody = $('#BattleOutcomeTable > tbody');

	var $cbShowDetails = $('#CbShowDetails');

	var $battleActionsPanel = $('#BattleActionsPanel');
	var $battleActionsError = $('#BattleActionsError');


	//
	// Initialize ECS world
	//
	var m_eworld = new ECS.EntityWorld();
	var m_gameState = new GameState();				m_eworld.store(GameState, m_gameState);
	var m_playersData = new PlayersData(m_eworld);	m_eworld.store(PlayersData, m_playersData);

	m_eworld.addSystem(m_eworld.store(UtilsSystem, new UtilsSystem()));

	var m_world = new GameWorld();
	m_eworld.addSystem(m_eworld.store(GameWorld, m_world));

	//
	// Gameplay Systems
	//
	var m_battle = m_eworld.store(BattleSystem, new BattleSystem(m_world));
	m_eworld.addSystem(m_battle);
	var m_effects = new EffectsSystem();
	m_eworld.addSystem(m_effects);
	//m_eworld.addSystem(new UnitsSystem()); // Fighting can destroy unit, breaking rendering.
	m_eworld.addSystem(new GameStateSystem());


	// HACK: replace with dummy, to ignore distance in battle.
	m_world.getDistance = function () {
		return 1;
	}

	//
	// Initialize elements
	//
	initializeParticipantLists();
	initializeTiles();
	$attackerList.change( refreshConfiguration );
	$defenderList.change( refreshConfiguration );
	$attackerTerrainList.change( onAttackerTerrainChange );
	$defenderTerrainList.change( onDefenderTerrainChange );

	$attackerHealth.on('input', onAttackerHealth ).change( onAttackerHealth );
	$defenderHealth.on('input', onDefenderHealth ).change( onDefenderHealth );
	$attackerModAttack.on('input', onAttackerModAttack ).change( onAttackerModAttack );
	$defenderModAttack.on('input', onDefenderModAttack ).change( onDefenderModAttack );
	$attackerModDefence.on('input', onAttackerModDefence ).change( onAttackerModDefence );
	$defenderModDefence.on('input', onDefenderModDefence ).change( onDefenderModDefence );

	restoreValues();

	$('#BtnSwapParticipants').click(onSwapParticipants);
	$('#BtnAttackModReset').click(onAttackModReset);
	$('#BtnDefenceModReset').click(onDefenceModReset);
	$('#BtnHealthReset').click(onHealthReset);

	$('#BtnPredict').click(onPredict);
	$('#BtnFight').click(onFight);
	$('#BtnFightBack').click(onFightBack);
	$('#BtnPredictAll').click(onPredictAll);

	$('#BtnSeparator').click(onSeparator);
	$('#BtnClear').click(onClear);
	$cbShowDetails.change(renderUnitStatistics);

	setTimeout(onPredict, 2);
});

