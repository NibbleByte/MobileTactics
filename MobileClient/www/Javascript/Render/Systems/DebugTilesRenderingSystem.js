//===============================================
// DebugTilesRenderingSystem
// Optimizes animations when scrolling (panning) the world.
//===============================================
"use strict";

var DebugTilesRenderingSystem = function (m_renderer) {
	var self = this;
	
	console.assert(m_renderer instanceof SceneRenderer, "SceneRenderer is required.");

	var m_tileSprites = [];
	
	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._eworldSB.subscribe(RenderEvents.Debug.TILE_DRAW_TEXT, onTileDrawText);
		self._eworldSB.subscribe(RenderEvents.Debug.CLEAR_TILES, onClearTiles);
	}

	var onTileDrawText = function (event, tile, text, opt_backgroundImage) {
		var pair = m_tileSprites.find(function (val) { return val.tile == tile});

		if (!pair) {
			var sprite = m_renderer.createSprite(WorldLayers.LayerTypes.Debug);
			var $text = $('<span class="debug_tile" />').appendTo(sprite.dom);
			$(sprite.dom).addClass('debug_tile_sprite');

			if (opt_backgroundImage) {
				$(sprite.dom).css('background-image', 'url(' + opt_backgroundImage + ')');
			}
			
			var coords = m_renderer.getRenderedTilePosition(tile.CTile.row, tile.CTile.column);

			sprite.position(coords.x, coords.y);
			sprite.size(GTile.TILE_WIDTH, GTile.TILE_HEIGHT);
			sprite.update();

			pair = {
				$text: $text,
				sprite: sprite,
				tile: tile,
			};

			m_tileSprites.push(pair);
		}

		text = text.toString().replace(/\n/g, '<br />');
		pair.$text.html(text);
	}

	var onClearTiles = function (event) {
		for(var i = 0; i < m_tileSprites.length; ++i) {
			var pair = m_tileSprites[i];
			
			pair.$text.detach();
			pair.sprite.remove();
		}

		m_tileSprites = [];
	}
}

ECS.EntityManager.registerSystem('DebugTilesRenderingSystem', DebugTilesRenderingSystem);
SystemsUtils.supplySubscriber(DebugTilesRenderingSystem);