//===============================================
// AITask
//
// Task that specific unit will try to carry out.
//===============================================
"use strict";

var AITask = function (priority, objective, creator, taskDoersLimit) {

	this.priority = priority;
	this.objective = objective;
	this.creator = creator;	// The system that created this task knows how to carry out the order.
							// Will call task.creator.carryOut(task);

	this.taskDoersLimit = taskDoersLimit || 1;
	this.taskDoers = [];
}

// Binds possible assignments to specific tasks.
var AIAssignment = function (score, task, taskDoer) {

	this.score = score;
	this.task = task;
	this.taskDoer = taskDoer;
}

AIAssignment.prototype.canAssign = function () {
	return this.task.taskDoers.length < this.task.taskDoersLimit && this.taskDoer.CAIData.task == null;
}

AIAssignment.prototype.assign = function () {
	
	if (Utils.assert(this.taskDoer && this.taskDoer.CAIData, 'Trying to assign task to invalid doer.'))
		return;
	if (Utils.assert(this.taskDoer.CAIData.task == null, 'Task is already assigned to this unit.'))
		return;

	this.task.taskDoers.push(this.taskDoer);

	this.taskDoer.CAIData.task = this.task;
}