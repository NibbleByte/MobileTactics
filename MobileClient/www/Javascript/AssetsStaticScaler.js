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
				if (animation.dontScale)
					continue;
				if (Utils.isNumber(animation.frameWidth)) animation.frameWidth *= Assets.scale;
				if (Utils.isNumber(animation.frameHeight)) animation.frameHeight *= Assets.scale;

				if (Utils.isNumber(animation.anchorX)) animation.anchorX *= Assets.scale;
				if (Utils.isNumber(animation.anchorY)) animation.anchorY *= Assets.scale;


				for(var i = 0; i < animation.sequences.length; ++i) {
					var sequence = animation.sequences[i];

					if (Utils.isNumber(sequence.startX)) sequence.startX *= Assets.scale;
					if (Utils.isNumber(sequence.startY)) sequence.startY *= Assets.scale;

					if (Utils.isNumber(sequence.frameWidth)) sequence.frameWidth *= Assets.scale;
					if (Utils.isNumber(sequence.frameHeight)) sequence.frameHeight *= Assets.scale;

					if (Utils.isNumber(sequence.anchorX)) sequence.anchorX *= Assets.scale;
					if (Utils.isNumber(sequence.anchorY)) sequence.anchorY *= Assets.scale;
				}

			} else {
				scaleAnimations(animation);
			}
		}
	}

	scaleAnimations(SpriteAnimations);

	$('#AssetsStats').text('AssetsScale: ' + Assets.scale.toFixed(1));
}

