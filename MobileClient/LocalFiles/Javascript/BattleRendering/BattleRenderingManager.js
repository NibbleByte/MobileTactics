//===============================================
// BattleRenderingManager
// Manages the battle rendering screen.
//===============================================
"use strict";

var BattleRenderingManager = new function () {
	var self = this;

	var STANDARD_WIDTH = 1000;
	var STANDARD_HEIGHT = 800;
	var STANDARD_RATIO = STANDARD_WIDTH / STANDARD_HEIGHT;
	var SCREEN_PADDING = 50;

	var m_$Screen = $('#Screen');
	var m_$BattleScreen = $('#BattleScreen');
	
	var subscriber = new DOMSubscriber();

	var resizeTimeout;
	var onScreenResize = function (event) {
		
		clearTimeout(resizeTimeout);

		// Give some time for refresh to happen and allow sizes to get applied (as done in iScroll).
		resizeTimeout = setTimeout(function () {
			var screenWidth = m_$Screen.width() - 50;
			var screenHeight = m_$Screen.height() - 50;

			var width = STANDARD_WIDTH;
			var height = STANDARD_HEIGHT;
			
			// Letterbox
			if (screenWidth < width || screenHeight < height) {
				var widthDiff = screenWidth - width;
				width += widthDiff;
				height += widthDiff / STANDARD_RATIO;
			
			
				var heightDiff = screenHeight - height;
				if (heightDiff < 0) {
					height += heightDiff;
					width += heightDiff * STANDARD_RATIO;
				}
			}
			
			m_$BattleScreen.width(width);
			m_$BattleScreen.height(height);

			
			self.eworldLeft.extract(BattleFieldRenderer).refreshScaleTo(Math.ceil(width / 2), height);
			self.eworldRight.extract(BattleFieldRenderer).refreshScaleTo(Math.floor(width / 2), height);
		}, 100);
	}

	var initializeBattleField = function ($field) {
		var eworld = new ECS.EntityWorld();
		var eworldSB = eworld.createSubscriber();

		eworld.addSystem(eworld.store(UtilsSystem, new UtilsSystem()));

		var renderer = eworld.store(BattleFieldRenderer, BattleFieldRenderer.Build($field[0], eworld));
		renderer.extentWidth = STANDARD_WIDTH / 2;
		renderer.extentHeight = STANDARD_HEIGHT;
		renderer.refresh();

		eworld.addSystem(new AnimationSystem(renderer));
		eworld.addSystem(new LayersUpdateSystem(renderer, BattleFieldRenderer.LayerTypes));

		return eworld;
	}

	this.eworldLeft = initializeBattleField($('#BattleFieldLeft'));
	this.eworldRight = initializeBattleField($('#BattleFieldRight'));

	subscriber.subscribe(window, 'load', onScreenResize);
	subscriber.subscribe(window, 'resize', onScreenResize);
	subscriber.subscribe(window, 'orientationchange', onScreenResize);
};
