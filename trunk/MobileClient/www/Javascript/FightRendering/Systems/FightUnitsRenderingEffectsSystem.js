//===============================================
// FightUnitsRenderingEffectsSystem
// 
//===============================================
"use strict";

var FightUnitsRenderingEffectsSystem = function (m_renderer) {
	var self = this;

	console.assert(m_renderer instanceof SceneRenderer, "SceneRenderer is required.");

	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._entityFilter.onEntityAddedHandler = registerUnit;

		self._eworldSB.subscribe(FightRenderingEvents.Animations.HURT, onHurt);
	}

	var registerUnit = function (unit) {
		unit.addComponent(CFightUnitRenderingEffects);
	}

	var onUpdateShake = function (tween, unit) {
		
		// On changing screen size causes restart of the fight and units get destroyed.
		// Tweener might still be executing, so just do nothing.
		if (Utils.isInvalidated(unit)) {
			Tweener.cancel(tween.tween);
			return;
		}

		unit.CSpatial.x = tween.x;

		self._eworld.trigger(FightRenderingEvents.Units.UNIT_MOVED, unit);
	}

	var onCompleteShake = function (tween, unit) {
		SpriteColorizeManager.clearSpriteBrightness(unit.CFightUnitRendering.sprite);
	}

	var onHurt = function (event, unit, params) {
		var effects = unit.CFightUnitRenderingEffects;

		if (effects.shakeData != null) {
			Tweener.cancel(effects.shakeData.tween);
			effects.shakeData = null;
		}

		effects.shakeData = {
			originalX: unit.CSpatial.x,
			x: unit.CSpatial.x - unit.CFightUnit.direction * 4,
		};

		SpriteColorizeManager.setSpriteBrightness(unit.CFightUnitRendering.sprite, 4);

		var tweenParams = [effects.shakeData, unit];

		effects.shakeData.tween = 
			Tweener.addTween(effects.shakeData, {x: unit.CSpatial.x, time: 0.2, delay: 0, transition: "linear", onUpdate: onUpdateShake, onUpdateParams: tweenParams, onComplete: onCompleteShake, onCompleteParams: tweenParams});
	}
}

ECS.EntityManager.registerSystem('FightUnitsRenderingEffectsSystem', FightUnitsRenderingEffectsSystem);
SystemsUtils.supplyComponentFilter(FightUnitsRenderingEffectsSystem, [CFightUnit]);