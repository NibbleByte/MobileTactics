//===============================================
// Goes through all static JS assets (Animations, etc.),
// and modifies their sizes according to the current asset scale.
// Must be invoked after everything needed has loaded.
//
//===============================================
"use strict";

var AssetsStaticScaler = new function () {
	
	var scaleAnimations = function (collection) {

		for(var name in collection) {
			var animation = collection[name];

			// Check if it is an animation or a collection of animations (namespace).
			if (animation.resourcePath) {
				animation.frameWidth *= Assets.scale;
				animation.frameHeight *= Assets.scale;

				animation.anchorX *= Assets.scale;
				animation.anchorY *= Assets.scale;

			} else {
				scaleAnimations(animation);
			}
		}
	}

	scaleAnimations(SpriteAnimations);

	$('#AssetsStats').text('AssetsScale: ' + Assets.scale.toFixed(1));
}

