//===============================================
// DevConsole
// Developer console.
//===============================================
"use strict";

var initConsole = function () {
	var Severities = {
		log: 'log',
		warning: 'warning',
		error: 'error',
	}

	var devConsole = $('#Console').hide();
	
	devConsole.log = function (message, severity, url, lineNumber) {
		var messageUrl = '';
		if (url) {
			messageUrl = url + ((lineNumber) ? ':' + lineNumber : '');
			messageUrl = '<br />[' + messageUrl.substring(messageUrl.indexOf("Javascript")) + ']';
		}

		$('<p>')
		.addClass(severity)
		.html(message.toString() + messageUrl)
		.prependTo(devConsole);

		if (severity == Severities.error || severity == Severities.warning)
			devConsole.show();
	};

	var extractUrlInfo = function (error, skipCalls) {
		if (skipCalls === undefined)
			skipCalls = 1;
		
		var url = error.stack.match(/:\/\/[^)\n]+/g)[skipCalls] || ':Unknown:#:#';
		var splits = url.split(':');
		var lineNumber = splits[splits.length - 2];
		url = splits.slice(0, splits.length - 2).join('');

		return { url: url, lineNumber: lineNumber };
	}

	//
	// Wrap logging functions
	//

	// Wrap the whole console object, as changing just the methods doesn't work on Android (HTC Explorer).
	var originalConsole = window.console;
	window.console = {
		log: function () {
			var message = '';
			for(var i = 0; i < arguments.length; ++i) {
				message += arguments[i] + ' ';
			}

			var urlInfo = extractUrlInfo(new Error());
			devConsole.log(message, Severities.log, urlInfo.url, urlInfo.lineNumber);

			return originalConsole.log.apply(originalConsole, arguments);
		},
		
		warn: function () {
			var message = '';
			for(var i = 0; i < arguments.length; ++i) {
				message += arguments[i] + ' ';
			}

			var urlInfo = extractUrlInfo(new Error());
			devConsole.log(message, Severities.warning, urlInfo.url, urlInfo.lineNumber);

			return originalConsole.warn.apply(originalConsole, arguments);
		},

		error: function () {
			var message = '';
			for(var i = 0; i < arguments.length; ++i) {
				message += arguments[i] + ' ';
			}

			var urlInfo = extractUrlInfo(new Error());
			devConsole.log(message, Severities.error, urlInfo.url, urlInfo.lineNumber);

			return originalConsole.error.apply(originalConsole, arguments);
		},

		assert: function (expression) {
			if (!expression) {
				var message = '';
				// Note: first argument is expression itself.
				for(var i = 1; i < arguments.length; ++i) {
					message += arguments[i] + ' ';
				}

				var urlInfo = extractUrlInfo(new Error());
				devConsole.log('Assertion failed: ' + message, Severities.error, urlInfo.url, urlInfo.lineNumber);
			}

			if (arguments.length == 1) {
				originalConsole.assert(expression);
				return;
			}

			if (arguments.length == 2) {
				originalConsole.assert(expression, arguments[1]);
				return;
			}

			return originalConsole.assert.apply(originalConsole, arguments);
		},
	}

	
	//
	// Wrap exception functions
	//
	window.onerror = function (errorMsg, url, lineNumber) {
		devConsole.log(errorMsg, Severities.error, url, lineNumber);
	}

	// Note: only tested on Android (HTC Explorer). Maybe there is no need for other platforms/newer devices.
	if (ClientUtils.isAndroid || ClientUtils.isIOS || ClientUtils.isWindowsPhone) {

		var wrappedHandlers = [];
		
		// window.onerror doesn't work on older devices (like Android HTC Explorer).
		// So instead of using window.onerror, try to listen for any exceptions ourselves.
		// All possible exception can only happen in jQuery event.
		var originalJQueryOn = jQuery.prototype.on;
		var originalJQueryOff = jQuery.prototype.off;

		jQuery.prototype.on = function () {
			var event = arguments[0];
			
			for(var i = 0; i < arguments.length; ++i) {
				
				// Wrap the event handler and listen for exceptions.
				if (Utils.isFunction(arguments[i])) {
					var handler = arguments[i];
					arguments[i] = function () {
						try {
							return handler.apply(this, arguments);
						} catch (err) {

							if (err.stack) {
								var urlInfo = extractUrlInfo(err, 0);
							
								// Log only if original exception, not re-throw from here.
								if (urlInfo.url.indexOf('DevConsole') == -1) {
									window.onerror('Uncaught Error: ' + err.message, urlInfo.url, urlInfo.lineNumber);
								}
							} else {
								devConsole.log(err.constructor.name + ': ' + err.message, Severities.error, 'Event: ' + event);
							}

							throw new Error(err.message);
						}
					};

					wrappedHandlers.push({
						handler: handler,
						wrapper: arguments[i],
					});

					break;
				}
			}

			return originalJQueryOn.apply(this, arguments);
		}

		jQuery.prototype.off = function () {
			var event = arguments[0];
			
			// Find the function and find the wrapper. Unbind the wrapper.
			for(var i = 0; i < arguments.length; ++i) {
				if (Utils.isFunction(arguments[i])) {
					var handler = arguments[i];

					var pair = wrappedHandlers.find(function (p) {
						return p.handler == handler;
					});

					if (pair) {
						arguments[i] = pair.wrapper;
						wrappedHandlers.remove(pair);
					}

					break;
				}
			}

			return originalJQueryOff.apply(this, arguments);
		}
	}

	return devConsole;
}