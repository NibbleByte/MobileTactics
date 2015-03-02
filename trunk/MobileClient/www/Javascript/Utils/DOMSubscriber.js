//===============================================
// DOMSubscriber
// Helps for subscribing/unsubscribing to DOM elements.
//===============================================
"use strict";

var DOMSubscriber = function () {
	var subscribes = [];

	this.subscribe = function (element, event, handler) {

		subscribes.push({
			$element: $(element).on(event, handler),
			event: event,
			handler: handler,
		});

	}

	this.unsubscribeAll = function () {
		for(var i = 0; i < subscribes.length; ++i) {
			var t = subscribes[i];
			t.$element.off(t.event, t.handler);
		}
	}
}