//===============================================
// RenderUtils
// Figure it out.
//===============================================
"use strict";

var RenderUtils = {
		
	// Add shadows to text span/div, by adding same text spans inside with black color and offset.
	addTextOutline: function (textElement) {
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
};

