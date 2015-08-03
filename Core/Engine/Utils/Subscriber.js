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
	obj.triggerAsync = Subscriber._triggerAsync;
	obj.__callSubscribers = Subscriber._callSubscribers;
	obj.__subscribers = {};		// Host holds down all subscriptions....
	obj.__triggersQueued = [];
	obj.__triggersCalls = [];	// DEBUG: Uncomment all __triggersCalls to view more debug info.
}

Subscriber._createSubscriber = function () {
	return new Subscriber(this);
}

// Triggers event with given data (synchronous).
// If first trigger (in trigger chain), at the end will process also any async triggers,
// accumulated along the way.
Subscriber._trigger = function (event, data) {
	
	console.assert(event);

	if (arguments.length > 2) {
		data = Array.prototype.slice.call(arguments, 1);
	} else if (Utils.isArray(data)){
		data = [data];
	}

	// Only first trigger called in the chain can process the async events.
	if (this.__triggerActive) {
		this.__callSubscribers(event, data);
		return;
	}
	
	this.__triggerActive = true;
	this.__triggersQueued.push({ event: event, data: data });
	//this.__triggersCalls.push({ event: event, data: data });	// DEBUG: This is for debugging purposes only.


	// Process all the events (even those that arise during the current trigger execution).
	while (this.__triggersQueued.length > 0) {
		var triggerData = this.__triggersQueued.shift();
		this.__callSubscribers(triggerData.event, triggerData.data);
	}

	//this.__triggersCalls = [];	// DEBUG: This is for debugging purposes only.
	this.__triggerActive = false;
}

// Triggers event with given data (asynchronous).
// Should be used with more global events, that can happen at anytime.
Subscriber._triggerAsync = function (event, data) {

	console.assert(event);

	if (this.__triggerActive) {

		if (arguments.length > 2) {
			data = Array.prototype.slice.call(arguments, 1);
		} else if (Utils.isArray(data)) {
			data = [data];
		}

		// Store the trigger data so it can processed later.
		this.__triggersQueued.push({ event: event, data: data });
		//this.__triggersCalls.push({ event: event, data: data });	// DEBUG: This is for debugging purposes only.
	} else {
		this.trigger.apply(this, arguments);
	}
}

Subscriber._callSubscribers = function (event, data) {

	var subscribers = this.__subscribers[event];
	if (!subscribers)
		return;

	if (Utils.isArray(data)) {
		for(var i = 0, len = subscribers.length; i < len; ++i) {
			var result = subscribers[i].apply(this, data);

			if (result && result.stopPropagation) {
				break;
			}
		}
	} else {
		for(var i = 0, len = subscribers.length; i < len; ++i) {
			var result = subscribers[i].call(this, data);

			if (result && result.stopPropagation) {
				break;
			}
		}
	}
}

//
// Subscriber methods
//

// NOTE: handlers can return result which will be handled by the subscriber.
//		 Result is an object that can have the following keys:
//		 stopPropagation (boolean) - should stop propagation of event.
Subscriber.prototype.subscribe = function(event, handler) {
	
	console.assert(event);
	console.assert(handler);
	
	this.host.__subscribers[event] = this.host.__subscribers[event] || [];
	this.host.__subscribers[event].push(handler);
	
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
			this.host.__subscribers[event].remove(handler);
			break;
		}
	}
}

Subscriber.prototype.unsubscribeAll = function() {
	
	while(this.subscribes.length > 0) {
		var subscriber = this.subscribes[0];
		this.unsubscribe(subscriber.event, subscriber.handler);
	}
	
	this.subscribes.length = 0;
}
