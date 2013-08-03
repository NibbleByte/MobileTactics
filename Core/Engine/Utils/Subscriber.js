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
	
	obj.createSubscriber = Subscriber._createSubscriber;
	
	obj.trigger = Subscriber._trigger;
}

Subscriber._createSubscriber = function () {
	return new Subscriber(this);
}

Subscriber._trigger = function(event, data) {
	$(this).trigger(event, data);
}

//
// Subscriber methods
//

Subscriber.prototype.subscribe = function(event, handler) {
	
	$(this.host).on(event, handler);
	
	this.subscribes.push({
		event: event,
		handler: handler
	});
}

Subscriber.prototype.unsubscribe = function(event, handler) {
		
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
    	this.host.unsubscribe(event, handler);
	}
	
	this.subscribes.length = 0;
}
