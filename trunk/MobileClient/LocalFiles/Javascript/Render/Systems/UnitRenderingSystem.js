//===============================================
// TilePlaceableRenderingSystem
// Renders a placeable in the world.
//===============================================
"use strict";

var UnitRenderingSystem = function (renderer) {
	var self = this;
	
	console.assert(renderer instanceof GameWorldRenderer, "GameWorldRenderer is required.");
	
	var REQUIRED_COMPONENTS = [CUnitRendering, CTilePlaceableRendering];
		
	//
	// Entity system initialize
	//
	this.onAdded = function () {
		m_eworld = this.getEntityWorld();
		m_eworldSB = m_eworld.createSubscriber();
		
		m_eworldSB.subscribe(EngineEvents.Placeables.PLACEABLE_REGISTERED, onPlaceableRegistered);
		m_eworldSB.subscribe(EngineEvents.Placeables.PLACEABLE_MOVED, onPlaceableMoved);
		m_eworldSB.subscribe(EngineEvents.Placeables.PLACEABLE_UNREGISTERED, onPlaceableUnregistered);
		
		m_eworldSB.subscribe(EngineEvents.Serialization.ENTITY_DESERIALIZED, onPlaceableMoved);
		
		m_eworldSB.subscribe(GameplayEvents.Units.UNIT_CHANGED, onUnitChanged);
		
		m_eworldSB.subscribe(RenderEvents.Animations.ANIMATION_FINISHED, onAnimationFinished);
	}
	
	this.onRemoved = function () {
		m_eworldSB.unsubscribeAll();
		m_eworldSB = null;
		m_eworld = null;
	}
	
	//
	// Fields
	//
	var m_eworld = null;
	var m_eworldSB = null;
	
	var m_renderer = renderer;
	
	
	var renderUnitInit = function (placeable) {
		var placeableRendering = placeable.CTilePlaceableRendering;
		
		var spritePath = UnitRenderingSystem.SPRITES_PATH.replace(/{colorId}/g, placeable.CPlayerData.playerId);
		
		// Get information depending if has animations or is still image.
		if (placeable.CAnimations) {
			var animData = SpriteAnimations[placeableRendering.skin];
			var animator = new Animator(animData, placeableRendering.sprite, m_renderer.scene);
			
			placeable.CAnimations.animators[UnitRenderingSystem.MAIN_SPRITE] = animator;
			animator.pauseSequence('Idle');
			placeableRendering.sprite.loadImg(spritePath + animator.resourcePath);
			
		} else {
			
			var resourcePath = spritePath + placeableRendering.skin + '.png';
			
			// Load asset and apply it when done.
			m_renderer.scene.loadImages([resourcePath], function () {
				placeableRendering.sprite.loadImg(resourcePath, (placeable.CAnimations) ? false : true);
				
				// Check if unit is registered, else it will be moved afterwards.
				if (placeable.CTilePlaceable.tile)
					renderUnit(placeable);
			});
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
	
	
	var onAnimationFinished = function(event, params) {
		if (!params.entity.hasComponents(REQUIRED_COMPONENTS))
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
		placeableRendering.sprite = m_renderer.layers[WorldLayers.LayerTypes.Units].Sprite();
		$(placeableRendering.sprite.dom).addClass('placeable');
		
		
		// Unit
		unitRendering.sprite = m_renderer.layers[WorldLayers.LayerTypes.Statistics].Sprite();
		unitRendering.$text.appendTo(unitRendering.sprite.dom);
		unitRendering.$text.text(placeable.CUnit.health);
		
		renderUnitInit(placeable);
	}
	
	var onPlaceableMoved = function(event, placeable) {
		
		if (!placeable.hasComponents(REQUIRED_COMPONENTS))
			return;
		
		renderUnit(placeable);
	}
	
	var onPlaceableUnregistered = function(event, placeable) {
		
		if (!placeable.hasComponents(REQUIRED_COMPONENTS))
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
}

UnitRenderingSystem.MAIN_SPRITE = 'MainSprite';
UnitRenderingSystem.SPRITES_PATH = 'Assets/Render/Images/Units/{colorId}/';

ECS.EntityManager.registerSystem('UnitRenderingSystem', UnitRenderingSystem);