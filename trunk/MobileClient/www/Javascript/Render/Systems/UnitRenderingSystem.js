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
		self._eworldSB.subscribe(GameplayEvents.Units.UNIT_TURN_POINTS_CHANGED, renderUnit);

		self._eworldSB.subscribe(GameplayEvents.Actions.ATTACK, onActionAttack);
		self._eworldSB.subscribe(GameplayEvents.Actions.HEAL, onActionHeal);

		self._eworldSB.subscribe(RenderEvents.Fog.REFRESH_FOG, refreshFog);
		
		self._eworldSB.subscribe(RenderEvents.IdleAnimations.START_IDLE_ANIMATION_UNIT, onIdleAnimation);
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
			Enums.getName(Player.Races, placeable.CUnit.race));

		var resourcePath;
		var animator = m_renderer.buildAnimator(placeableRendering.skin, placeableRendering.sprite, SpriteAnimations.Units);
		
		// Get information depending if has animations or is still image.
		if (animator) {
			var animations = placeable.addComponentSafe(CAnimations);

			resourcePath = spritePath.replace(/{fileName}/g, animator.resourcePath);
			
			animations.add(UnitRenderingSystem.MAIN_ANIM, animator);
			animator.pauseSequence('Idle');
			
		} else {
			resourcePath = spritePath.replace(/{fileName}/g, placeableRendering.skin + '.png');
			placeableRendering.sprite.setOpacity(0.999);	// HACK: to skip FastTrack feature for static images!
		}

		// So culling works correctly.
		placeable.CUnitRendering.sprite.size(50, 30);
		placeable.CUnitRendering.sprite.anchorX = m_renderer.zoomBack(32) * Assets.scale;
		placeable.CUnitRendering.sprite.anchorY = m_renderer.zoomBack(-4) * Assets.scale;

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

		applyVisibilityFog(placeable);
		
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
		unitRendering.move(coords.x, coords.y, m_renderer);
		unitRendering.showFinished(placeable.CUnit.finishedTurn && placeable.CTilePlaceable.tile.CTileRendering.viewerVisible);
	}

	var onIdleAnimation = function (unit) {
		IdleAnimationsSystem.playRandomIdleAnimation(unit.CAnimations.animators[UnitRenderingSystem.MAIN_ANIM]);
	}

	var onAnimationFinished = function(params) {
		if (!params.entity.hasComponents(UnitRenderingSystem.REQUIRED_COMPONENTS))
			return;
		
		if (params.name == UnitRenderingSystem.MAIN_ANIM) {
			params.entity.CAnimations.animators[UnitRenderingSystem.MAIN_ANIM].pauseSequence('Idle');
		}
	}
	
	var onPlaceableRegistered = function(placeable) {
		
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
		$(unitRendering.sprite.dom).addClass('statistics_text_container');
		unitRendering.$text.appendTo(unitRendering.sprite.dom);
		RenderUtils.addTextOutline(unitRendering.$text);
		unitRendering.spriteFinished = m_renderer.createSprite(WorldLayers.LayerTypes.UnitsFinished, UnitRenderingSystem.FINISHED_FOG_SPRITE_PATH);
		unitRendering.hideFinished();
		
		renderUnitInit(placeable);

		onUnitChanged(placeable);
	}
	
	var onPlaceableMoving = function(placeable) {
		
		if (!placeable.hasComponents(UnitRenderingSystem.REQUIRED_COMPONENTS))
			return;

		renderUnit(placeable);
	}
	
	var onPlaceableUnregistered = function(placeable) {
		
		if (!placeable.hasComponents(UnitRenderingSystem.REQUIRED_COMPONENTS))
			return;

		if (placeable.CAnimations) {
			placeable.CAnimations.remove(UnitRenderingSystem.MAIN_ANIM);
		}

		placeable.removeComponent(CUnitRendering);
		placeable.removeComponent(CTilePlaceableRendering);
	}
	
	var onUnitChanged = function(unit) {
		unit.CUnitRendering.$text.text(unit.CUnit.health);
		RenderUtils.addTextOutline(unit.CUnitRendering.$text)
	}


	var FLOAT_TEXT_OFFSET = { x: 35, y: -12 };
	var onActionAttack = function (outcome) {

		if (outcome.attackerHealthOutcome > 0 && outcome.attackerTile.CTileRendering.viewerVisible) {
			var intent = (outcome.damageToAttacker > 0) ? RenderIntents.Negative : RenderIntents.Positive;
			var sign = (outcome.damageToAttacker > 0) ? '-' : '';
			self._eworld.trigger(RenderEvents.OverlayEffects.FLOAT_TEXT_TILE, outcome.attackerTile, sign + outcome.damageToAttacker,
				{ offset: FLOAT_TEXT_OFFSET, intent: intent }
			);
		}

		if (outcome.defenderHealthOutcome > 0 && outcome.defenderTile.CTileRendering.viewerVisible) {
			var intent = (outcome.damageToDefender > 0) ? RenderIntents.Negative : RenderIntents.Positive;
			var sign = (outcome.damageToDefender > 0) ? '-' : '';
			self._eworld.trigger(RenderEvents.OverlayEffects.FLOAT_TEXT_TILE, outcome.defenderTile, sign + outcome.damageToDefender,
				{ offset: FLOAT_TEXT_OFFSET, intent: intent }
			);
		}
	}

	var onActionHeal = function (unit, amount) {
		if (unit.CTilePlaceable.tile.CTileRendering.viewerVisible) {
			self._eworld.trigger(RenderEvents.OverlayEffects.FLOAT_TEXT_TILE,unit.CTilePlaceable.tile, '+' +  amount, 
				{ offset: FLOAT_TEXT_OFFSET, intent: RenderIntents.Positive }
			);
		}
	}


	var applyVisibilityFog = function (placeable) {
		var placeableRendering = placeable.CTilePlaceableRendering;
		var unitRendering = placeable.CUnitRendering;

		if (placeable.CTilePlaceable.tile.CTileRendering.viewerVisible) {
			placeableRendering.show();
			unitRendering.show();
		} else {
			placeableRendering.hide();
			unitRendering.hide();
		}
	}

	var refreshFog = function () {
		self._eworld.extract(GameWorld).iterateAllPlaceables(applyVisibilityFog);
	}
}

UnitRenderingSystem.REQUIRED_COMPONENTS = [CUnitRendering, CTilePlaceableRendering];
UnitRenderingSystem.MAIN_ANIM = AnimationSystem.getAnimationToken('Unit');
UnitRenderingSystem.SPRITES_PATH = 'Assets-Scaled/Render/Images/Units/{race}/{fileName}';
UnitRenderingSystem.FINISHED_FOG_SPRITE_PATH = 'Assets-Scaled/Render/Images/FinishedHexFog.png';

ECS.EntityManager.registerSystem('UnitRenderingSystem', UnitRenderingSystem);
SystemsUtils.supplyComponentFilter(UnitRenderingSystem, UnitRenderingSystem.REQUIRED_COMPONENTS);