//===============================================
// TilePlaceableRenderingSystem
// Renders a placeable in the world.
//===============================================
"use strict";

var UnitRenderingSystem = function (renderer) {
	var self = this;
	
	console.assert(renderer instanceof SceneRenderer, "SceneRenderer is required.");
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(EngineEvents.Placeables.PLACEABLE_REGISTERED, onPlaceableRegistered);
		self._eworldSB.subscribe(EngineEvents.Placeables.PLACEABLE_MOVING, onPlaceableMoving);
		self._eworldSB.subscribe(EngineEvents.Placeables.PLACEABLE_UNREGISTERING, onPlaceableUnregistered);
		
		self._eworldSB.subscribe(EngineEvents.Serialization.ENTITY_DESERIALIZED, onPlaceableMoving);
		
		self._eworldSB.subscribe(GameplayEvents.Units.UNIT_CHANGED, onUnitChanged);

		self._eworldSB.subscribe(GameplayEvents.Fog.REFRESH_FOG, refreshFog);
		
		self._eworldSB.subscribe(RenderEvents.Animations.ANIMATION_FINISHED, onAnimationFinished);
	}
		
	//
	// Private
	//
	var m_renderer = renderer;
	var m_requiresRefresh = false;
	
	
	var renderUnitInit = function (placeable) {
		var placeableRendering = placeable.CTilePlaceableRendering;
		
		var spritePath = UnitRenderingSystem.SPRITES_PATH.replace(/{race}/g, 
			Enums.getName(Player.Races, placeable.CPlayerData.player.race));

		var resourcePath;
		var animator = m_renderer.buildAnimator(placeableRendering.skin, placeableRendering.sprite);
		
		// Get information depending if has animations or is still image.
		if (animator) {
			var animations = placeable.addComponentSafe(CAnimations);

			resourcePath = spritePath.replace(/{fileName}/g, animator.resourcePath);
			
			animations.add(UnitRenderingSystem.MAIN_SPRITE, animator);
			animator.pauseSequence('Idle');
			
		} else {
			resourcePath = spritePath.replace(/{fileName}/g, placeableRendering.skin + '.png');
			placeableRendering.sprite.setOpacity(0.999);	// HACK: to skip FastTrack feature for static images!
		}

		m_renderer.loadSprite(placeableRendering.sprite, resourcePath, onResourcesLoaded, placeable);
	}
	

	// Apply loaded resources.
	var onResourcesLoaded = function (sprite, placeable) {

		SpriteColorizeManager.colorizeSprite(sprite, placeable.CPlayerData.player.colorHue);

		// Fallback for static images
		if (!placeable.CAnimations) {
			sprite.anchorX = sprite.w / 2;
			sprite.anchorY = sprite.h / 2;
		}

		// Check if unit is registered, else it will be moved afterwards.
		if (placeable.CTilePlaceable.tile)
			renderUnit(placeable);
	}

	
	var renderUnit = function (placeable) {
		
		var row = placeable.CTilePlaceable.tile.CTile.row;
		var column = placeable.CTilePlaceable.tile.CTile.column;
		
		var coords = m_renderer.getRenderedTileCenter(row, column);
		
		var placeableRendering = placeable.CTilePlaceableRendering;
		var unitRendering = placeable.CUnitRendering;
		
		if (placeableRendering.sprite.w) {
			placeableRendering.move(coords.x, coords.y);

			placeableRendering.sprite.depth = coords.y;
			self._eworld.trigger(RenderEvents.Layers.SORT_DEPTH, placeableRendering.sprite);

		} else {
			// NOTE: Animated units automatically have sizes, while static ones need to be loaded!
			//		 This means they still cannot have a valid position.
			//		 This is why we hide them way off-screen, or they will pop at 0,0 once loaded.
			placeableRendering.move(-9999, -9999);
		}
		
		// Position the health at the bottom right corner.
		unitRendering.move(coords.x, coords.y);
		unitRendering.showFinished(placeable.CUnit.finishedTurn);
	}

	var onAnimationFinished = function(event, params) {
		if (!params.entity.hasComponents(UnitRenderingSystem.REQUIRED_COMPONENTS))
			return;
		
		if (params.name == UnitRenderingSystem.MAIN_SPRITE)
			params.entity.CAnimations.animators[UnitRenderingSystem.MAIN_SPRITE].pauseSequence('Idle');
	}
	
	var onPlaceableRegistered = function(event, placeable) {
		
		// Only interested in units.
		if (!placeable.hasComponents(CUnit))
			return;
		
		var placeableRendering = placeable.addComponent(CTilePlaceableRendering);
		var unitRendering = placeable.addComponent(CUnitRendering);
		
		placeableRendering.skin = placeable.CUnit.name;
		
		// Placeable
		placeableRendering.sprite = m_renderer.createSprite(WorldLayers.LayerTypes.Units);
		
		// Unit
		unitRendering.sprite = m_renderer.createSprite(WorldLayers.LayerTypes.Statistics);
		unitRendering.$text.appendTo(unitRendering.sprite.dom);
		unitRendering.spriteFinished = m_renderer.createSprite(WorldLayers.LayerTypes.UnitsFinished, UnitRenderingSystem.FINISHED_FOG_SPRITE_PATH);
		unitRendering.hideFinished();
		
		renderUnitInit(placeable);

		onUnitChanged(event, placeable);
	}
	
	var onPlaceableMoving = function(event, placeable) {
		
		if (!placeable.hasComponents(UnitRenderingSystem.REQUIRED_COMPONENTS))
			return;

		renderUnit(placeable);
	}
	
	var onPlaceableUnregistered = function(event, placeable) {
		
		if (!placeable.hasComponents(UnitRenderingSystem.REQUIRED_COMPONENTS))
			return;

		if (placeable.CAnimations) {
			placeable.CAnimations.remove(UnitRenderingSystem.MAIN_SPRITE);
		}

		placeable.removeComponent(CUnitRendering);
		placeable.removeComponent(CTilePlaceableRendering);
	}
	
	var onUnitChanged = function(event, unit) {
		if (unit.CUnit.health != unit.CStatistics.statistics['MaxHealth']) {
			unit.CUnitRendering.$text.text(unit.CUnit.health);
		} else {
			unit.CUnitRendering.$text.text('');
		}
	}


	var applyVisibilityFog = function (placeable) {
		var placeableRendering = placeable.CTilePlaceableRendering;
		var unitRendering = placeable.CUnitRendering;

		if (placeable.CTilePlaceable.tile.CTileVisibility.visible) {
			placeableRendering.show();
			unitRendering.show();
		} else {
			placeableRendering.hide();
			unitRendering.hide();
		}
	}

	var refreshFog = function (event) {
		self._eworld.extract(GameWorld).iterateAllPlaceables(applyVisibilityFog);
	}
}

UnitRenderingSystem.REQUIRED_COMPONENTS = [CUnitRendering, CTilePlaceableRendering];
UnitRenderingSystem.MAIN_SPRITE = 'MainSprite';
UnitRenderingSystem.SPRITES_PATH = 'Assets-Scaled/Render/Images/Units/{race}/{fileName}';
UnitRenderingSystem.FINISHED_FOG_SPRITE_PATH = 'Assets-Scaled/Render/Images/FinishedHexFog.png';

ECS.EntityManager.registerSystem('UnitRenderingSystem', UnitRenderingSystem);
SystemsUtils.supplyComponentFilter(UnitRenderingSystem, UnitRenderingSystem.REQUIRED_COMPONENTS);