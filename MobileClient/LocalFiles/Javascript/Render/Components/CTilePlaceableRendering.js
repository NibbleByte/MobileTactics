"use strict";

var CTilePlaceableRendering = function () {
	var self = this;
	
	this.skin = '';
	
	this.$renderedPlaceable = $('<div class="placeable" />');
	this.$image = $('<img class="placeable_image" />')
		.appendTo(this.$renderedPlaceable)
		// TODO: Having handlers on each object placed on map, might be slow. Maybe use .one.
		.load(function() {
			self.$image.css('left', -self.$image.width() / 2);
			self.$image.css('top', -self.$image.height() / 2);
			self.$image.show();
		});
};

ComponentsUtils.registerNonPersistent('CTilePlaceableRendering', CTilePlaceableRendering);



//
//Short-cuts
//	
CTilePlaceableRendering.prototype.renderAt = function (x, y) {
	this.$renderedPlaceable
	.css('top', y)
	.css('left', x);
};

// NOTE: call this after attached to DOM, or else the image won't have width/height. 
CTilePlaceableRendering.prototype.refreshSkin = function () {	
	this.$image 
	.hide()
	.attr("src","Assets/Render/Images/" + this.skin + ".png");
};
