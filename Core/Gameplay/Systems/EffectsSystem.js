//===============================================
// EffectsSystem
// Handles gameplay effects.
//===============================================
"use strict";

var EffectsSystem = function () {
	var self = this;
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(EngineEvents.Placeables.PLACEABLE_REGISTERED, onPlaceableRegistered);
		self._eworldSB.subscribe(GameplayEvents.GameState.TURN_CHANGED, onTurnChanged);
	}
	
	//
	// Effects
	//
	
	// Get all effects that modify this statistic
	this.getStatisticModifyingEffects = function (placeable, statistic) {		
		var foundEffects = [];
		var effects = placeable.CEffects.effects;
		
		for(var i = 0; i < effects.length; ++i) {
			var effect = effects[i];
			
			for(var j = 0; j < effect.statisticsModifiers.length; ++j) {
				var stModifier = effect.statisticsModifiers[j];
				if (statistic == stModifier.statistic) {
					foundEffects.push(effect);
					break;
				}
			}
		}
		
		return foundEffects;
	};
	
	var onTurnChanged = function (gameState, hasJustLoaded) {
		if (hasJustLoaded)
			return;

		advance(1.0, gameState.currentPlayer);
	}
	
	// Advance players' placeable's effects.
	var advance = function (timePassed, player) {
		
		// Advance all entities
		for(var i = 0; i < self._entityFilter.entities.length; ++i) {
			var placeable = self._entityFilter.entities[i];
			
			if (placeable.CPlayerData.player == player) {
				advanceEffects(placeable, timePassed);
			}
		}
		
		// Cleanup
		// Process all, as one could have affected other effects.
		for(var i = 0; i < self._entityFilter.entities.length; ++i) {
			var placeable = self._entityFilter.entities[i];
			cleanExpiredEffects(placeable);
		}
	}
	
	
	// Recalculate all statistics by applying their modifiers
	var recalculateStatistics = function (placeable) {
		var accumulatedModifiers = {};
		var effects = placeable.CEffects.effects;
		
		// Extract accumulated modifiers to statistics
		for(var i = 0; i < effects.length; ++i) {
			var effect = effects[i];
			
			// Statistics modifiers
			for(var j = 0; j < effect.statisticsModifiers.length; ++j) {
				var stModifier = effect.statisticsModifiers[j];
				
				console.assert(stModifier instanceof StatisticModifier);
				
				accumulatedModifiers[stModifier.statistic] = accumulatedModifiers[stModifier.statistic] || 0.0;
				accumulatedModifiers[stModifier.statistic] += stModifier.modifier;
			}
		}
		
		
		// Apply accumulated modifiers (only existing ones)
		placeable.CStatistics.resetStatistics();
		var statistics = placeable.CStatistics.statistics;
		
		for(var statistic in statistics) {
			statistics[statistic] += statistics[statistic] * (accumulatedModifiers[statistic] || 0.0) / 100;
		}
	};
	
	
	// Advance effects according to time passed, execute handlers.
	var advanceEffects = function (placeable, timePassed) {
		var effects = placeable.CEffects.effects;
		
		if (undefined == timePassed)
			timePassed = 1;
		
		// Apply all effects
		for(var i = 0; i < effects.length; ++i) {
			var effect = effects[i];
			
			if (effect.applyExecutor) {
				effect.advanceExecutor(placeable, timePassed, Effect.userData);
			}
			
			if (effect.timeLeft != null) {
				effect.timeLeft -= timePassed;
			}
		}
	};
	
	
	// Cleans expired effects. Should be called at the end of an update,
	// to assure that all updates have taken effect equally.
	var cleanExpiredEffects = function (placeable) {
		var effects = placeable.CEffects.effects;
		
		var needRecalculate = false;
		for(var i = 0; i < effects.length; ++i) {
			if (effects[i].timeLeft != null && effects[i].timeLeft <= 0) {
				effects.splice(i, 1);
				
				needRecalculate = true;
			}
		}
		
		if (needRecalculate)
			recalculateStatistics(placeable);
	};
	
	
	//
	// World events
	//
	var onPlaceableRegistered = function(placeable) {				
		recalculateStatistics(placeable);
	}
};

ECS.EntityManager.registerSystem('EffectsSystem', EffectsSystem);
SystemsUtils.supplyComponentFilter(EffectsSystem, [CStatistics, CEffects]);