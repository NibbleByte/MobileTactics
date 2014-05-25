//===============================================
// TilePlaceableRenderingSystem
// Renders a placeable in the world.
//===============================================
"use strict";

var UnitRenderingSystem = function (renderer) {
	var self = this;
	
	console.assert(renderer instanceof GameWorldRenderer, "GameWorldRenderer is required.");
	
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
		
		var spritePath = UnitRenderingSystem.SPRITES_PATH;
		var resourcePath;
		var animator = m_renderer.buildAnimator(placeableRendering.skin, placeableRendering.sprite);
		
		// Get information depending if has animations or is still image.
		if (animator) {
			var animations = placeable.addComponentSafe(CAnimations);

			resourcePath = spritePath + animator.resourcePath;
			
			animations.animators[UnitRenderingSystem.MAIN_SPRITE] = animator;
			animator.pauseSequence('Idle');
			
		} else {
			resourcePath = spritePath + placeableRendering.skin + '.png';
		}

		m_renderer.loadImages(resourcePath, onResourcesLoaded, placeable, placeableRendering);
	}
	

	// Apply loaded resources.
	var onResourcesLoaded = function (resourcePath, placeable, placeableRendering) {

		placeableRendering.sprite.loadImg(resourcePath, (placeable.CAnimations) ? false : true);
		SpriteColorizeManager.colorizeSprite(placeableRendering.sprite, placeable.CPlayerData.player.colorHue);

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
			placeableRendering.move(
					coords.x - placeableRendering.sprite.w / 2,
					coords.y - placeableRendering.sprite.h / 2
					);
		}
		
		// Position the health at the bottom right corner.
		unitRendering.move(coords.x, coords.y);
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
		unitRendering.$text.text(placeable.CUnit.health);
		
		renderUnitInit(placeable);
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
			placeable.CAnimations.animators[UnitRenderingSystem.MAIN_SPRITE].destroy();
		}
		
		placeable.CUnitRendering.detach();
		placeable.CTilePlaceableRendering.detach();
	}
	
	var onUnitChanged = function(event, unit) {
		unit.CUnitRendering.$text.text(unit.CUnit.health.toPrecision(2));
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
UnitRenderingSystem.SPRITES_PATH = 'Assets/Render/Images/Units/';

ECS.EntityManager.registerSystem('UnitRenderingSystem', UnitRenderingSystem);
SystemsUtils.supplyComponentFilter(UnitRenderingSystem, UnitRenderingSystem.REQUIRED_COMPONENTS);