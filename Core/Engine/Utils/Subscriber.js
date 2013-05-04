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

Subscriber.makeSubscribable = function (obj) {
	
	obj.createSubscriber = function () {
		return new Subscriber(obj);
	}
	
	obj.trigger = function(event, data) {
		$(obj).trigger(event, data);
	}
}

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