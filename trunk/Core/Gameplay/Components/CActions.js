"use strict";

var CActions = function CActions() {
	this.actions = [];
};

ComponentsUtils.registerPersistent(CActions);

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
		actions[i] = Actions.Classes[input.actions[i]];
	}
	
	output.actions = actions;
};
