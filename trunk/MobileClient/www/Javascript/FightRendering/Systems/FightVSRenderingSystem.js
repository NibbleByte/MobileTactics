//===============================================
// FightVSRenderingSystem
// 
//===============================================
"use strict";

var FightVSRenderingSystem = function (m_renderer) {
	var self = this;

	console.assert(m_renderer instanceof SceneRenderer, "SceneRenderer is required.");
	
	var m_vsEntity = null;

	//
	// Entity system initialize
	//
	this.initialize = function () {

		m_vsEntity = new ECS.Entity();

		renderVSInit(m_vsEntity);

		self._eworld.addUnmanagedEntity(m_vsEntity);

		self._eworldSB.subscribe(FightRenderingEvents.Fight.START_FIGHT, onStartFight);
		self._eworldSB.subscribe(FightRenderingEvents.Fight.UNINITIALIZE, onUninitializeFight);
	}

	var onStartFight = function () {
		var animator = m_vsEntity.CAnimations.animators[FightVSRenderingSystem.MAIN_ANIM];

		animator.sprite.show();

		animator.playSequence('Idle0');

		var x = FightRenderingManager.FightFrame.left + FightRenderingManager.FightFrame.width / 2;
		var y = FightRenderingManager.FightFrame.top + FightRenderingManager.FightFrame.height / 2;
		animator.sprite.position(x, y);
		animator.sprite.update();
	}
	
	var onUninitializeFight = function () {
		var animator = m_vsEntity.CAnimations.animators[FightVSRenderingSystem.MAIN_ANIM];

		animator.sprite.hide();
	}

	var renderVSInit = function (entity) {

		var sprite = m_renderer.createSprite(FightRenderer.LayerTypes.VS);
		var animator = new Animator(SpriteAnimations.Fight.VS, sprite, m_renderer.scene);

		var spritePath = FightVSRenderingSystem.SPRITES_PATH.replace(/{fileName}/g, animator.resourcePath);

		var animations = entity.addComponent(CAnimations);
		animations.add(FightVSRenderingSystem.MAIN_ANIM, animator);

		sprite.hide();

		m_renderer.loadSprite(sprite, spritePath);
	}
}

FightVSRenderingSystem.MAIN_ANIM = AnimationSystem.getAnimationToken('VS');
FightVSRenderingSystem.SPRITES_PATH = 'Assets-Scaled/Render/Images/Fight/{fileName}';

ECS.EntityManager.registerSystem('FightVSRenderingSystem', FightVSRenderingSystem);
SystemsUtils.supplySubscriber(FightVSRenderingSystem);