//===============================================
// FloatingTextsSystem
// Show floating texts/numbers over the world.
//===============================================
"use strict";

var FloatingTextsSystem = function (m_renderer) {
	var self = this;
	
	console.assert(m_renderer instanceof SceneRenderer, "SceneRenderer is required.");

	var m_textSprites = [];

	var DEFAULT_PARAMS = {
		intent: null,
		offset: { x: 0, y: 0 },
		duration: 3.0		// seconds
	}
	
	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._eworldSB.subscribe(RenderEvents.OverlayEffects.FLOAT_TEXT_TILE, onFloatTextTile);
		self._eworldSB.subscribe(RenderEvents.OverlayEffects.CLEAR_TEXTS, onClearTexts);

		self._eworldSB.subscribe(RenderEvents.Animations.ANIMATION_AFTER_FRAME, onAnimationAfterFrame);
	}


	var onFloatTextTile = function (event, tile, text, params) {

		text = text.toString().replace(/\n/g, '<br />');

		params = $.extend({}, DEFAULT_PARAMS, params);

		var sprite = m_renderer.createSprite(WorldLayers.LayerTypes.OverlayEffects);
		$(sprite.dom).addClass('floating_text_container');

		var $text = $('<span class="floating_text statistics_text" />')
		.css({top: params.offset.y * Assets.scale, left: params.offset.x * Assets.scale})
		.addClass((params.intent) ? 'floating_text_intent_' + params.intent : null)
		.appendTo(sprite.dom)
		.html(text);

		RenderUtils.addTextOutline($text);
			
		var coords = m_renderer.getRenderedTileCenter(tile.CTile.row, tile.CTile.column);
		m_renderer.zoomBackCoords(coords);

		sprite.position(coords.x, coords.y);
		sprite.update();

		var pair = {
			$text: $text,
			sprite: sprite,
			timeLeft: params.duration * 1000,
		};

		m_textSprites.push(pair);

	}

	var onAnimationAfterFrame = function (event, processedAnimationsData, ticker) {
		for(var i = 0; i < m_textSprites.length; ++i) {
			var pair = m_textSprites[i];

			pair.timeLeft -= ticker.lastTicksElapsed * ticker.tickDuration;
			if (pair.timeLeft <= 0) {
				pair.$text.detach();
				pair.sprite.remove();

				m_textSprites.removeAt(i);
				--i;
				continue;
			}
				
			
			var sprite = pair.sprite;
			sprite.move(0, -0.1 * ticker.lastTicksElapsed);
			sprite.update();
		}
	}

	var onClearTexts = function (event) {
		for(var i = 0; i < m_textSprites.length; ++i) {
			var pair = m_textSprites[i];
			
			pair.$text.detach();
			pair.sprite.remove();
		}

		m_textSprites = [];
	}
}

ECS.EntityManager.registerSystem('FloatingTextsSystem', FloatingTextsSystem);
SystemsUtils.supplySubscriber(FloatingTextsSystem);