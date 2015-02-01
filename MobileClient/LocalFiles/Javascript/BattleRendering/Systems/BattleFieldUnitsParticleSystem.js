//===============================================
// BattleFieldUnitsParticleSystem
// Renders unit particles field.
//===============================================
"use strict";

var BattleFieldUnitsParticleSystem = function (m_renderer) {
	var self = this;

	console.assert(m_renderer instanceof SceneRenderer, "SceneRenderer is required.");

	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(BattleRenderingEvents.Units.UNIT_KILLED, onUnitKilled);
	}

	var onUnitKilled = function (event, battleUnit) {

		if (!battleUnit.CAnimations)
			return;

		var spatial = battleUnit.CSpatial;
		var animations = battleUnit.CAnimations;
		var rendering = battleUnit.CBattleUnitRendering;
		
		var animData = SpriteAnimations.Particles.GroundExplosion;
		rendering.spriteExplosion = m_renderer.createSprite(BattleFieldRenderer.LayerTypes.Particles, animData.resourcePath);
		rendering.spriteExplosion.position(spatial.x, spatial.y);
		rendering.spriteExplosion.depth = spatial.y;


		var animator = new Animator(animData, rendering.spriteExplosion, m_renderer.scene);
		animations.add(BattleFieldUnitsParticleSystem.EXPLOSION_SPRITE, animator);
		animator.playSequence('Boom');

		rendering.spriteExplosion.update();

		self._eworld.trigger(RenderEvents.Layers.SORT_DEPTH, rendering.spriteExplosion);
	}
	

	// TODO: Remove SimpleAnimationsFactory, CSimpleAnimation and all other shit with it!
}

BattleFieldUnitsParticleSystem.EXPLOSION_SPRITE = 'ExplosionSprite';

ECS.EntityManager.registerSystem('BattleFieldUnitsParticleSystem', BattleFieldUnitsParticleSystem);
SystemsUtils.supplySubscriber(BattleFieldUnitsParticleSystem);