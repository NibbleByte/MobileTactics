//===============================================
// BattleFieldBackgroundSystem
// Renders field.
//===============================================
"use strict";

var BattleFieldBackgroundSystem = function (m_renderer) {
	var self = this;
	
	console.assert(m_renderer instanceof SceneRenderer, "SceneRenderer is required.");
	
	var m_sprite = null;

	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(BattleRenderingEvents.Battle.INITIALIZE, onInitializeBattle);
	}

	var onInitializeBattle = function (event, outcome, unit) {

		if (m_sprite) {
			m_sprite.remove();
			m_sprite = null;
		}
		
		var tile = unit.CTilePlaceable.tile;
		var terrainName = Enums.getName(GameWorldTerrainType, tile.CTileTerrain.type);

		var spritePath = BattleFieldBackgroundSystem.BACKGROUND_SPRITES_PATH.replace(/{terrainType}/g, terrainName);
		m_sprite = m_renderer.createSprite(BattleFieldRenderer.LayerTypes.Background, spritePath, onSpriteLoaded);
	}

	var onSpriteLoaded = function (sprite) {
		sprite.move(0, 0);
		self._eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, BattleFieldRenderer.LayerTypes.Background);

		// Optimization, to unload resources (probably)
		setTimeout(unloadSprite, 0);
	}
	
	var unloadSprite = function () {
		m_sprite.remove();
		m_sprite = null;
	}
}

BattleFieldBackgroundSystem.BACKGROUND_SPRITES_PATH = 'Assets/Render/Images/BattleRendering/Terrains/{terrainType}.png';

ECS.EntityManager.registerSystem('BattleFieldBackgroundSystem', BattleFieldBackgroundSystem);
SystemsUtils.supplySubscriber(BattleFieldBackgroundSystem);