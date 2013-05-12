"use strict";

var CEffects = function (go_this) {
	var self = this;
	
	// Return calculated statistics
	this.UMessage('getStatistics', function (statistics) {		
		return m_calcStatistics;
	}, 10);
	
	
	// Get all effects that modify this statistic
	this.UMessage('getStatisticModifyingEffects', function (statistic) {		
		var effects = [];
		
		for(var i = 0; i < m_effects.length; ++i) {
			var effect = m_effects[i];
			
			for(var j = 0; j < effect.statisticsModifiers.length; ++j) {
				var stModifier = effect.statisticsModifiers[j];
				if (statistic == stModifier.statistic) {
					effects.push(effect);
					break;
				}
			}
		}
		
		return effects;
	});
	
	
	// Recalculate all statistics by applying their modifiers
	this.UMessage('recalculateStatistics', function () {		
		var accumulatedModifiers = {};
		
		// Extract accumulated modifiers to statistics
		for(var i = 0; i < m_effects.length; ++i) {
			var effect = m_effects[i];
			
			// Statistics modifiers
			for(var j = 0; j < effect.statisticsModifiers.length; ++j) {
				var stModifier = effect.statisticsModifiers[j];
				
				console.assert(stModifier instanceof StatisticModifier);
				
				accumulatedModifiers[stModifier.statistic] = accumulatedModifiers[stModifier.statistic] || 0.0;
				accumulatedModifiers[stModifier.statistic] += stModifier.modifier;
			}
		}
		
		
		// Apply accumulated modifiers (only existing ones)
		var statistics = go_this.baseStatistics();
		$.extend(m_calcStatistics, statistics);
		
		for(var statistic in m_calcStatistics) {
			m_calcStatistics[statistic] += m_calcStatistics[statistic] * (accumulatedModifiers[statistic] || 0.0) / 100;
		}
	});
	
	
	// Advance effects according to time passed, execute handlers.
	this.UMessage('advanceEffects', function (timePassed) {
		
		if (undefined == timePassed)
			timePassed = 1;
		
		// Apply all effects
		for(var i = 0; i < m_effects.length; ++i) {
			var effect = m_effects[i];
			
			if (effect.applyExecutor) {
				effect.advanceExecutor(go_this, timePassed, Effect.userData);
			}
			
			if (effect.timeLeft != null) {
				effect.timeLeft -= timePassed;
			}
		}
	});
	
	
	// Cleans expired effects. Should be called at the end of an update,
	// to assure that all updates have taken effect equally.
	this.UMessage('cleanExpiredEffects', function () {
		
		var needRecalculate = false;
		for(var i = 0; i < m_effects.length; ++i) {
			if (m_effects[i].timeLeft != null && m_effects[i].timeLeft <= 0) {
				m_effects.splice(i, 1);
				
				needRecalculate = true;
			}
		}
		
		if (needRecalculate)
			go_this.recalculateStatistics();
	});
	
	
	// Add effect to this game object and recalculate statistics.
	this.UMessage('addEffect', function (effect) {		
		m_effects.push(effect);
		
		go_this.recalculateStatistics();
	});
	
	// Remove effect to this game object and recalculate statistics.
	this.UMessage('removeEffect', function (effect) {
		var index = m_effects.indexOf(effect);
		m_effects.splice(index, 1);
		
		go_this.recalculateStatistics();
	});
	
	
	//
	// Private
	//
	var m_calcStatistics = {};
	var m_effects = [];
};

EntityManager.registerComponent('CEffects', CEffects);
EntityManager.addComponentDependencies(CEffects, CStatistics);
