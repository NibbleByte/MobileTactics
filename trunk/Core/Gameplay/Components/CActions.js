"use strict";

var CActions = function () {
	this.actions = [];
};

ComponentsUtils.registerPersistent('CActions', CActions);

CActions.serialize = function (input, output) {
	
	var actions = [];
	actions.length = input.actions.length;
	
	for(var i = 0; i < input.actions.length; ++i) {
		actions[i] = input.actions[i].actionName;
	}
	
	output.actions = actions;
};

CActions.deserialize = function (input, output) {
	
	var actions = [];
	actions.length = input.actions.length;
	
	for(var i = 0; i < input.actions.length; ++i) {
		actions[i] = Actions[input.actions[i]];
	}
	
	output.actions = actions;
};
