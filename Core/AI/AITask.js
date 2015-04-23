//===============================================
// AITask
//
// Task that specific unit will try to carry out.
//===============================================
"use strict";

var AITask = function (objective, creator, scoreLimit) {

	this.objective = objective;
	this.creator = creator;	// The system that created this task knows how to carry out the order.
							// Will call task.creator.carryOut(task);

	this.scoreAssigned = 0;
	this.scoreLimit = scoreLimit;
	this.taskDoers = [];
}

// Binds possible assignments to specific tasks.
var AIAssignment = function (priority, score, task, taskDoer) {

	this.priority = priority;
	this.score = score;
	this.task = task;
	this.taskDoer = taskDoer;
}

AIAssignment.prototype.isValid = function () {
	return this.task && this.taskDoer && this.taskDoer.isAttached();
}

AIAssignment.prototype.canAssign = function () {
	return this.task.scoreAssigned < this.task.scoreLimit && this.taskDoer.CAIData.task == null;
}

AIAssignment.prototype.assign = function () {
	
	if (Utils.assert(this.taskDoer && this.taskDoer.CAIData, 'Trying to assign task to invalid doer.'))
		return;
	if (Utils.assert(this.taskDoer.CAIData.task == null, 'Task is already assigned to this unit.'))
		return;

	this.task.taskDoers.push(this.taskDoer);
	this.task.scoreAssigned += this.score;

	this.taskDoer.CAIData.task = this.task;
}