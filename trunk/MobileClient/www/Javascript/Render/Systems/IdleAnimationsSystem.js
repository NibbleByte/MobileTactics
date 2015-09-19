//===============================================
// IdleAnimationsSystem
// Deals with idle animations.
//===============================================
"use strict";

var IdleAnimationsSystem = function () {
	var self = this;
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		m_unitTimer = setTimeout(startRandomUnitIdleAnimation, MathUtils.randomIntRange(1000, 6000));
		m_structureTimer = setTimeout(startRandomStructureIdleAnimation, MathUtils.randomIntRange(1000, 6000));
	}
	
	this.uninitialize = function () {
		clearTimeout(m_unitTimer);
		clearTimeout(m_structureTimer);
		m_unitTimer = null;
		m_structureTimer = null;
	}
	
	//
	// Private
	//
	var m_unitTimer = null;
	var m_structureTimer = null;
	
	var startRandomUnitIdleAnimation = function () {

		m_unitTimer = setTimeout(startRandomUnitIdleAnimation, MathUtils.randomIntRange(1000, 6000));

		// Don't play animations while animation is paused, or they will freeze.
		if (self._eworld.getSystem(AnimationSystem).isPaused())
			return;

		// Find only visible entities.
		var entities = [];
		for(var i = 0; i < self._entityFilter.entities.length; ++i) {
			var entity = self._entityFilter.entities[i];

			if (!entity.CTilePlaceableRendering.sprite.isCulled())
				continue;

			// Editor does not have CTileVisibility.
			if (!entity.CTilePlaceable.tile.CTileVisibility || entity.CTilePlaceable.tile.CTileVisibility.visible)
				entities.push(entity);
		}
		
		if (entities.length == 0)
			return;
		
		var entity = MathUtils.randomElement(entities);
		
		var animator = entity.CAnimations.animators[UnitRenderingSystem.MAIN_SPRITE];
		if (animator.sequenceName == 'Idle') {
			IdleAnimationsSystem.playRandomIdleAnimation(animator);
		}
	}

	var startRandomStructureIdleAnimation = function () {
		
		m_structureTimer = setTimeout(startRandomStructureIdleAnimation, MathUtils.randomIntRange(500, 3000));

		// Don't play animations while animation is paused, or they will freeze.
		if (self._eworld.getSystem(AnimationSystem).isPaused())
			return;


		// Find only suitable tiles
		var tiles = [];
		var gameWorld = self._eworld.getSystem(GameWorld);

		gameWorld.iterateAllTiles(function (tile) {

			if (!tile.CAnimations || !tile.CTileRendering.sprite.isCulled())
				return;

			if (tile.CAnimations.animators[TileRenderingSystem.TILES_SPRITE_ANIMATION].isPlaying())
				return;

			// Editor does not have CTileVisibility.
			if (!tile.CTileVisibility || tile.CTileVisibility.visible)
				tiles.push(tile);
		});

		if (tiles.length == 0)
			return;
		
		var tile = MathUtils.randomElement(tiles);
		
		var animator = tile.CAnimations.animators[TileRenderingSystem.TILES_SPRITE_ANIMATION];
		IdleAnimationsSystem.playRandomIdleAnimation(animator);
	}
}


IdleAnimationsSystem.playRandomIdleAnimation = function (animator) {

	var idleIndexes = [];
	for(var i = 0; i < animator.sequences.length; ++i) {
		if (IdleAnimationsSystem.IDLE_ANIMATION_PATTERN.test(animator.sequences[i])) {
			idleIndexes.push(i);
		}
	}
			
			
	if (idleIndexes.length > 0) {
		animator.playSequence(animator.sequences[MathUtils.randomElement(idleIndexes)]);
	}

}

IdleAnimationsSystem.playsIdleAnimation = function (animator) {
	return IdleAnimationsSystem.IDLE_ANIMATION_PATTERN.test(animator.sequenceName);
}

IdleAnimationsSystem.RANDOM_UNIT_IDLE_ANIMATION_INTERVAL = 4000;
IdleAnimationsSystem.IDLE_ANIMATION_PATTERN = /Idle\d+/i;

ECS.EntityManager.registerSystem('IdleAnimationsSystem', IdleAnimationsSystem);
SystemsUtils.supplyComponentFilterOnly(IdleAnimationsSystem, [CUnitRendering, CAnimations]);