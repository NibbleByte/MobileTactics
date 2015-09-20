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
			var unit = self._entityFilter.entities[i];

			if (!unit.CAnimations || !unit.CTilePlaceableRendering.sprite.isCulled())
				continue;

			if (unit.CAnimations.animators[UnitRenderingSystem.MAIN_SPRITE].isPlaying())
				continue;

			// Editor does not have CTileVisibility.
			if (!unit.CTilePlaceable.tile.CTileVisibility || unit.CTilePlaceable.tile.CTileVisibility.visible)
				entities.push(unit);
		}
		
		if (entities.length == 0)
			return;
		
		var unit = MathUtils.randomElement(entities);

		self._eworld.trigger(RenderEvents.IdleAnimations.START_IDLE_ANIMATION_UNIT, unit);
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

		self._eworld.trigger(RenderEvents.IdleAnimations.START_IDLE_ANIMATION_STRUCTURE, tile);
	}
}


IdleAnimationsSystem.playRandomIdleAnimation = function (animator, pattern) {

	pattern = pattern || IdleAnimationsSystem.IDLE_ANIMATION_PATTERN;
	
	var idleIndexes = [];
	for(var i = 0; i < animator.sequences.length; ++i) {
		if (pattern.test(animator.sequences[i])) {
			idleIndexes.push(i);
		}
	}
			
			
	if (idleIndexes.length > 0) {
		animator.playSequence(animator.sequences[MathUtils.randomElement(idleIndexes)]);
		return true;
	}

	return false;
}

IdleAnimationsSystem.playsIdleAnimation = function (animator) {
	return IdleAnimationsSystem.IDLE_ANIMATION_PATTERN.test(animator.sequenceName);
}

IdleAnimationsSystem.RANDOM_UNIT_IDLE_ANIMATION_INTERVAL = 4000;
IdleAnimationsSystem.IDLE_ANIMATION_PATTERN = /Idle\d+/i;

ECS.EntityManager.registerSystem('IdleAnimationsSystem', IdleAnimationsSystem);
SystemsUtils.supplyComponentFilterOnly(IdleAnimationsSystem, [CUnitRendering, CAnimations]);