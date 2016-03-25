//===============================================
// VictoryStateMonitor
// 
//===============================================
"use strict";

var VictoryStateMonitor = function () {
	var self = this;

	var m_playersData = null;
	var m_gameState = null;
	var m_cheapestUnits = [];
	
	//
	// Entity system initialize
	//
	
	this.initialize = function () {
		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADING, onGameLoading);
		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGING, onTurnChanging);

		self._eworldSB.subscribe(GameplayEvents.Structures.CAPTURE_FINISHED, onCaptureFinished);

		for(var race = 0; race < UnitsDefinitions.length; ++race) {
			var cheapestUnit = null;

			for(var key in UnitsDefinitions[race]) {
				var definition = UnitsDefinitions[race][key];

				if (cheapestUnit == null || definition.price < cheapestUnit.price)
					cheapestUnit = definition;
			}

			m_cheapestUnits[race] = cheapestUnit;
		}
	}

	var onGameLoading = function () {
		m_gameState = self._eworld.extract(GameState);
		m_playersData = self._eworld.extract(PlayersData);
	}

	var onTurnChanging = function (gameState, hasJustLoaded) {

		if (hasJustLoaded)
			return;

		// Player is defeated when has no units and has all its production buildings occupied,
		// or his HQ is taken over.

		var hasNoUnits = m_playersData.players.clone();
		var hasNoProduction = m_playersData.players.clone();
		var hasNoIncome = m_playersData.players.clone();

		for(var i = 0; i < self._entityFilter.entities.length; ++i) {
			var unit = self._entityFilter.entities[i];

			hasNoUnits.remove(unit.CPlayerData.player);
		}


		for(var i = 0; i < m_gameState.ownerableStructures.length; i++) {
			var tile = m_gameState.ownerableStructures[i];
			var type = tile.CTileTerrain.type;
			var owner = tile.CTileOwner.owner;


			if (type == GameWorldTerrainType.Base || type == GameWorldTerrainType.Factory) {
				var placeable = tile.CTile.placedObjects[0];
				var relation = PlayersData.Relation.Neutral;

				if (owner && placeable)
					relation = m_playersData.getRelation(owner, placeable.CPlayerData.player);

				if (owner && relation != PlayersData.Relation.Enemy) {
					hasNoProduction.remove(owner);
				}
			}


			if (type == GameWorldTerrainType.Base || type == GameWorldTerrainType.Minerals) {
				if (owner) {
					hasNoIncome.remove(owner);
				}
			}
		}



		for(var i = 0; i < hasNoUnits.length; ++i) {
			var player = hasNoUnits[i];

			if (hasNoProduction.contains(player)) {
				self._eworld.trigger(GameplayEvents.GameState.PLAYER_DEFEATED, player);
				checkWinCondition();
			}

			if (hasNoIncome.contains(player) && player.credits < m_cheapestUnits[player.race].price) {
				self._eworld.trigger(GameplayEvents.GameState.PLAYER_DEFEATED, player);
				checkWinCondition();
			}
		}
	}

	var onCaptureFinished = function (tile, previousOwner) {
		
		if (tile.CTileTerrain.type == GameWorldTerrainType.HQ) {
			// TODO: If 3 or more players, taking HQ that wasn't originally yours would lead to defeat?
			self._eworld.trigger(GameplayEvents.GameState.PLAYER_DEFEATED, previousOwner);
			checkWinCondition();
		}
	}

	var checkWinCondition = function () {
		
		var firstPlayer = m_playersData.getFirstPlayingPlayer();

		if (firstPlayer == null)
			return;

		var winners = [];

		for(var i = 0; i < m_playersData.players.length; ++i) {
			var player = m_playersData.players[i];

			if (player.isPlaying) {
				var relation = m_playersData.getRelation(firstPlayer, player);
				if (relation == PlayersData.Relation.Enemy)
					return;

				if (relation == PlayersData.Relation.Ally)
					winners.push(player);
			}
		}

		
		self._eworld.trigger(GameplayEvents.GameState.PLAYERS_VICTORIOUS, winners);
	}
};

ECS.EntityManager.registerSystem('VictoryStateMonitor', VictoryStateMonitor);
SystemsUtils.supplyComponentFilter(VictoryStateMonitor, [CPlayerData]);