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
		
		self._eworldSB.subscribe(RenderEvents.Animations.ANIMATION_PROGRESSED, onAnimationProgressed);
		self._eworldSB.subscribe(RenderEvents.Animations.ANIMATION_FINISHED, onAnimationFinished);
		self._eworldSB.subscribe(RenderEvents.Animations.ANIMATION_AFTER_FRAME, onAnimationAfterFrame);
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

		// Handler to apply loaded resources.
		var resourcesLoadedHandler = function () {
			placeableRendering.sprite.loadImg(resourcePath, (placeable.CAnimations) ? false : true);
			SpriteColorizeManager.colorizeSprite(placeableRendering.sprite, placeable.CPlayerData.player.colorHue);

			// Check if unit is registered, else it will be moved afterwards.
			if (placeable.CTilePlaceable.tile)
				renderUnit(placeable);
		}

		
		// Get information depending if has animations or is still image.
		if (placeable.CAnimations) {
			var animData = SpriteAnimations[placeableRendering.skin];
			var animator = new Animator(animData, placeableRendering.sprite, m_renderer.scene);

			resourcePath = spritePath + animator.resourcePath;
			
			placeable.CAnimations.animators[UnitRenderingSystem.MAIN_SPRITE] = animator;
			animator.pauseSequence('Idle');
			m_renderer.scene.loadImages([resourcePath], resourcesLoadedHandler);
			
		} else {
			
			resourcePath = spritePath + placeableRendering.skin + '.png';
			
			// Load asset and apply it when done.
			m_renderer.scene.loadImages([resourcePath], resourcesLoadedHandler);
		}
	}
	
	
	var renderUnit = function (placeable) {
		
		var row = placeable.CTilePlaceable.tile.CTile.row;
		var column = placeable.CTilePlaceable.tile.CTile.column;
		
		var coords = m_renderer.getRenderedTileCenter(row, column);
		
		var placeableRendering = placeable.CTilePlaceableRendering;
		var unitRendering = placeable.CUnitRendering;
		
		if (placeableRendering.sprite.w) {
			placeableRendering.sprite.position(
					coords.x - placeableRendering.sprite.w / 2,
					coords.y - placeableRendering.sprite.h / 2
					);
			placeableRendering.sprite.update();
		}
		
		// Position the health at the bottom right corner.
		unitRendering.sprite.position(coords.x, coords.y);
		unitRendering.sprite.update();
	}

	// Refresh units layer canvas
	var refreshUnitsLayer = function () {
		m_renderer.layers[WorldLayers.LayerTypes.Units].clear();
		for (var i = 0; i < self._entityFilter.entities.length; ++i) {
			var entity = self._entityFilter.entities[i];

			// This unit is not yet registered.
			if (!entity.CTilePlaceableRendering)
				continue;

			// If unit was just placed, image might not have been loaded yet.
			if (!entity.CTilePlaceableRendering.sprite.img)
				continue;

			if (entity.CTilePlaceableRendering.spriteVisible)
				entity.CTilePlaceableRendering.sprite.update();
		}
	}
	
	
	var onAnimationProgressed = function(event, params) {
		if (params.entity.hasComponents(CUnit)) {
			m_requiresRefresh = true;
		}
	};

	var onAnimationFinished = function(event, params) {
		if (!params.entity.hasComponents(UnitRenderingSystem.REQUIRED_COMPONENTS))
			return;
		
		if (params.name == UnitRenderingSystem.MAIN_SPRITE)
			params.entity.CAnimations.animators[UnitRenderingSystem.MAIN_SPRITE].pauseSequence('Idle');

		onAnimationProgressed(event, params);
	}
	
	var onAnimationAfterFrame = function(event) {
		if (m_requiresRefresh) {
			refreshUnitsLayer();
			m_requiresRefresh = false;
		}
	}
	
	var onPlaceableRegistered = function(event, placeable) {
		
		// Only interested in units.
		if (!placeable.hasComponents(CUnit))
			return;
		
		var placeableRendering = placeable.addComponent(CTilePlaceableRendering);
		var unitRendering = placeable.addComponent(CUnitRendering);
		
		placeableRendering.skin = placeable.CUnit.name;
		
		// Placeable
		placeableRendering.sprite = m_renderer.layers[WorldLayers.LayerTypes.Units].Sprite();
		
		// Unit
		unitRendering.sprite = m_renderer.layers[WorldLayers.LayerTypes.Statistics].Sprite();
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
		
		placeable.CUnitRendering.$text.detach();
		placeable.CUnitRendering.sprite.remove();
		placeable.CTilePlaceableRendering.sprite.remove();
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

		// NOTE: All unit sprites must be updated/moved before refreshing.
		refreshUnitsLayer();
	}
}

UnitRenderingSystem.REQUIRED_COMPONENTS = [CUnitRendering, CTilePlaceableRendering];
UnitRenderingSystem.MAIN_SPRITE = 'MainSprite';
UnitRenderingSystem.SPRITES_PATH = 'Assets/Render/Images/Units/';

ECS.EntityManager.registerSystem('UnitRenderingSystem', UnitRenderingSystem);
SystemsUtils.supplyComponentFilter(UnitRenderingSystem, UnitRenderingSystem.REQUIRED_COMPONENTS);