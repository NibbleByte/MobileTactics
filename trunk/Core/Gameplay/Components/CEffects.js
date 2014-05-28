"use strict";

var CEffects = function CEffects() {
	this.effects = [];
};

ComponentsUtils.registerPersistent(CEffects);	


//===============================================
//Effect
//Effect applied to given placeable, modifying its statistics or active stats.
//===============================================
"use strict";

var Effect = function () {
	this.timeLeft = null;			// Time left before the effect expires.
	this.statisticsModifiers = [];
	this.advanceExecutor = null;	// User handler to be executed on advancing effect.
	this.userData = null;			// User data to be passed to the user handler.
};

// Short-cut for adding statistics modifier.
Effect.prototype.addStatisticModifier = function (statistic, modifier) {
	this.statisticsModifiers.push(new StatisticModifier(statistic, modifier))
} 

// Statistic modifier.
var StatisticModifier = function (statistic, modifier) {
	this.statistic = statistic;
	this.modifier = modifier;
}


Serialization.registerClass(Effect, 'Effect');
Serialization.registerClass(StatisticModifier, 'StatisticModifier');