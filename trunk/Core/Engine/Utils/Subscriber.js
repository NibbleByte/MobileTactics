//===============================================
// Subscriber
// Helps keep track of subscribed methods
// Supports subscribing to host that has subscribe/unsubscribe methods
//===============================================
"use strict";

var Subscriber = function (host) {
	this.host = host;
	this.subscribes = [];
}

//
// Host methods
//

Subscriber.makeSubscribable = function (obj) {
	
	console.assert(obj);
	
	obj.createSubscriber = Subscriber._createSubscriber;
	
	obj.trigger = Subscriber._trigger;
	obj.__triggersQueued = [];
}

Subscriber._createSubscriber = function () {
	return new Subscriber(this);
}

// Triggers event with given data.
// If another trigger is already in progress (trigger chain), 
// the new trigger will be queued and executed when done with the previous ones.
// It is recommended to use these asynchronous triggers, to avoid more problems.
Subscriber._trigger = function (event, data) {
	
	console.assert(event);
	
	// Store the trigger data so it can processed later.
	this.__triggersQueued.push({ event: event, data: data })

	// If this trigger is the only stored trigger, start executing directly.
	// Else, there are currently other triggers being executed, so skip.
	if (this.__triggersQueued.length == 1) {

		while (this.__triggersQueued.length > 0) {
			var triggerData = this.__triggersQueued[0];

			$(this).trigger(triggerData.event, triggerData.data);
			this.__triggersQueued.shift();
		}
	}
}

// Triggers event with given data immediately.
// This is NOT recommended and should be avoided.
Subscriber._triggerSync = function (event, data) {

	console.assert(event);

	$(this).trigger(event, data);
}

//
// Subscriber methods
//

Subscriber.prototype.subscribe = function(event, handler) {
	
	console.assert(event);
	console.assert(handler);
	
	$(this.host).on(event, handler);
	
	this.subscribes.push({
		event: event,
		handler: handler
	});
}

Subscriber.prototype.unsubscribe = function(event, handler) {
	
	console.assert(event);
	console.assert(handler);
		
	for (var i = 0; i < this.subscribes.length; ++i) {
		var subscriber = this.subscribes[i];
		if (subscriber.event === event && subscriber.handler === handler) { 
			this.subscribes.splice(i, 1);
			$(this.host).off(event, handler);
			break;
		}
	}
}

Subscriber.prototype.unsubscribeAll = function() {
	
	for (var i = 0; i < this.subscribes.length; ++i) {
		var subscriber = this.subscribes[i];
		this.unsubscribe(subscriber.event, subscriber.handler);
	}
	
	this.subscribes.length = 0;
}
