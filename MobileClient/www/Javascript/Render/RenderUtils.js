//===============================================
// RenderUtils
// Figure it out.
//===============================================
"use strict";

var RenderUtils = {
		
	// Add shadows to text span/div, by adding same text spans inside with black color and offset.
	addTextOutline: function (textElement) {
		
		var androidVer = ClientUtils.isAndroid ? parseFloat(ClientUtils.androidVersion) : 9999;

		// HACK: Android 2.x doesn't support properly textShadow with 0 blur radius. Check text_outline_shadow class.
		if (RenderUtils.supports('textShadow') && androidVer >= 3) {
			$(textElement).addClass('text_outline_shadow');
			return;
		}

		var $text = $(textElement);
		var text = $text.text().trim();

		$('<span class="text_outline left_top" />')
		.text(text)
		.appendTo($text);

		$('<span class="text_outline right_top" />')
		.text(text)
		.appendTo($text);

		$('<span class="text_outline right_bottom" />')
		.text(text)
		.appendTo($text);

		$('<span class="text_outline left_bottom" />')
		.text(text)
		.appendTo($text);
	},

	// Checks if specific style property is supported by browser: supports('textShadow');
	// Source: http://code.tutsplus.com/tutorials/quick-tip-detect-css3-support-in-browsers-with-javascript--net-16444
	supports: (function() {
		var div = document.createElement('div');
		var vendors = 'Khtml Ms O Moz Webkit'.split(' ');
 
		return function(prop) {
			if ( prop in div.style ) return true;
 
			prop = prop.replace(/^[a-z]/, function(val) {
				return val.toUpperCase();
			});
 
			var len = vendors.length;
			while(len--) {
				if ( vendors[len] + prop in div.style ) {
					return true;
				} 
			  }
			return false;
		};
	})(),


	transformSet: function (element, value) {
		$(element).css({
			'-webkit-transform': value,
			'-moz-transform': value,
			'-ms-transform': value,
			'-o-transform': value,
			'transform': value
		});
	},

	trasnformAppend: function (element, value) {
		$(element).css({
			'-webkit-transform'	: $(element).css('-webkit-transform') + value,
			'-moz-transform'	: $(element).css('-moz-transform') + value,
			'-ms-transform'		: $(element).css('-ms-transform') + value,
			'-o-transform'		: $(element).css('-o-transform') + value,
			'transform'			: $(element).css('transform') + value
		});
	},

};

