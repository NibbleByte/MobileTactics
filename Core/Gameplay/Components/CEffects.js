"use strict";

var CEffects = function () {
	this.statistics = {};
	this.effects = [];
};

ECS.EntityManager.registerComponent('CEffects', CEffects);	
	
// Get all effects that modify this statistic
CEffects.prototype.getStatisticModifyingEffects = function (statistic) {		
	var effects = [];
	
	for(var i = 0; i < this.effects.length; ++i) {
		var effect = this.effects[i];
		
		for(var j = 0; j < effect.statisticsModifiers.length; ++j) {
			var stModifier = effect.statisticsModifiers[j];
			if (statistic == stModifier.statistic) {
				effects.push(effect);
				break;
			}
		}
	}
	
	return effects;
};


// Recalculate all statistics by applying their modifiers
CEffects.prototype.recalculateStatistics = function (statistics) {		
	var accumulatedModifiers = {};
	
	// Extract accumulated modifiers to statistics
	for(var i = 0; i < this.effects.length; ++i) {
		var effect = this.effects[i];
		
		// Statistics modifiers
		for(var j = 0; j < effect.statisticsModifiers.length; ++j) {
			var stModifier = effect.statisticsModifiers[j];
			
			console.assert(stModifier instanceof StatisticModifier);
			
			accumulatedModifiers[stModifier.statistic] = accumulatedModifiers[stModifier.statistic] || 0.0;
			accumulatedModifiers[stModifier.statistic] += stModifier.modifier;
		}
	}
	
	
	// Apply accumulated modifiers (only existing ones)
	$.extend(this.statistics, statistics);
	
	for(var statistic in this.statistics) {
		this.statistics[statistic] += this.statistics[statistic] * (accumulatedModifiers[statistic] || 0.0) / 100;
	}
};


// Advance effects according to time passed, execute handlers.
CEffects.prototype.advanceEffects = function (entity, timePassed) {
	
	if (undefined == timePassed)
		timePassed = 1;
	
	// Apply all effects
	for(var i = 0; i < this.effects.length; ++i) {
		var effect = this.effects[i];
		
		if (effect.applyExecutor) {
			effect.advanceExecutor(entity, timePassed, Effect.userData);
		}
		
		if (effect.timeLeft != null) {
			effect.timeLeft -= timePassed;
		}
	}
};


// Cleans expired effects. Should be called at the end of an update,
// to assure that all updates have taken effect equally.
CEffects.prototype.cleanExpiredEffects = function () {
	
	var needRecalculate = false;
	for(var i = 0; i < this.effects.length; ++i) {
		if (this.effects[i].timeLeft != null && this.effects[i].timeLeft <= 0) {
			this.effects.splice(i, 1);
			
			needRecalculate = true;
		}
	}
	
	if (needRecalculate)
		this.recalculateStatistics(); // TODO: REFACTOR
};


// Add effect to this game object and recalculate statistics.
CEffects.prototype.addEffect = function (effect) {		
	this.effects.push(effect);
	
	this.recalculateStatistics(); // TODO: REFACTOR
};

// Remove effect to this game object and recalculate statistics.
CEffects.prototype.removeEffect = function (effect) {
	var index = this.effects.indexOf(effect);
	this.effects.splice(index, 1);
	
	this.recalculateStatistics(); // TODO: REFACTOR
};
