//===============================================
// TasksMonitor
// Monitors if there are currently some executing tasks
// and notifies for any change.
//===============================================
"use strict";

var TasksMonitor = function () {
	
	this.subscribes = [];
	this.tasks = [];

}

TasksMonitor.prototype.subscribe = function (handler) {
	this.subscribes.push(handler);
}

TasksMonitor.prototype.unsubscribe = function (handler) {
	this.subscribes.remove(handler);
}

TasksMonitor.prototype.addTask = function (task) {
	this.tasks.push(task);

	for(var i = 0; i < this.subscribes.length; ++i) {
		this.subscribes[i](task, this);
	}
}

TasksMonitor.prototype.removeTask = function (task) {
	this.tasks.remove(task);

	for (var i = 0; i < this.subscribes.length; ++i) {
		this.subscribes[i](task, this);
	}
}

TasksMonitor.prototype.hasTasks = function () {
	return this.tasks.length != 0;
}


