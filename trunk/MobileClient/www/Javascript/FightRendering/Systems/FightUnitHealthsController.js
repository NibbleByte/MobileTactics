//===============================================
// FightUnitHealthsController
// Controls stats.
//===============================================
"use strict";

var FightUnitHealthsController = function (m_renderer) {
	var self = this;
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		
		m_leftSprite = m_renderer.createSprite(FightRenderer.LayerTypes.Stats);
		m_rightSprite = m_renderer.createSprite(FightRenderer.LayerTypes.Stats);

		m_leftHealthBar = new FightHealthBar(m_leftSprite.dom, FightRenderer.DirectionType.Left);
		m_rightHealthBar = new FightHealthBar(m_rightSprite.dom, FightRenderer.DirectionType.Right);

		m_leftSprite.position(-1000, -1000);
		m_leftSprite.update();
		
		m_rightSprite.position(-1000, -1000);
		m_rightSprite.update();


		self._eworldSB.subscribe(FightRenderingEvents.Fight.INITIALIZE, onInitializeFight);
		self._eworldSB.subscribe(FightRenderingEvents.Fight.UNINITIALIZE, onUninitializeFight);

		self._eworldSB.subscribe(FightRenderingEvents.Animations.HURT, onHurt);

		self._eworldSB.subscribe(FightRenderingEvents.Layout.LAYOUT_CHANGED, onLayoutChanged);
	}
	
	//
	// Private
	//
	var m_leftHealthBar = null;
	var m_rightHealthBar = null;
	var m_leftSprite = null;
	var m_rightSprite = null;

	var onInitializeFight = function () {
		
		m_leftSprite.position(-1000, -1000);
		m_leftSprite.update();

		m_rightSprite.position(-1000, -1000);
		m_rightSprite.update();

		var battleStats = self._entityWorld.blackboard[FightRenderingBlackBoard.Battle.LEFT_STATS];
		m_leftHealthBar.setBar(battleStats.health / battleStats.healthMax);
		m_leftHealthBar.setValue(battleStats.health);

		var battleStats = self._entityWorld.blackboard[FightRenderingBlackBoard.Battle.RIGHT_STATS];
		m_rightHealthBar.setBar(battleStats.health / battleStats.healthMax);
		m_rightHealthBar.setValue(battleStats.health);
	}

	var onUninitializeFight = function () {
		// Note: hide texts on uninitialize, because on slow devices can be seen on show up for a moment.
		m_leftSprite.position(-1000, -1000);
		m_leftSprite.update();

		m_rightSprite.position(-1000, -1000);
		m_rightSprite.update();
	}

	var updateHealth = function (tween, unit, healthBar) {

		// On changing screen size causes restart of the fight and units get destroyed.
		// Tweener might still be executing, so just do nothing.
		if (!Utils.isValidEntity(unit))
			return;


		var battleStats = unit.CFightUnit.battleStats;
		healthBar.setBar(tween.health / battleStats.healthMax);
		healthBar.setValue(Math.round(tween.health));
	}

	var onHurt = function (unit, params) {

		// Avoid health drop effect more than once.
		if (unit.CFightUnitRenderingEffects.healthHurt)
			return;

		unit.CFightUnitRenderingEffects.healthHurt = true;


		var healthBar = m_leftHealthBar;
		if (unit.CFightUnit.direction == FightRenderer.DirectionType.Left)
			healthBar = m_rightHealthBar;

		var battleStats = unit.CFightUnit.battleStats;
		var hurtTween = { health: battleStats.health };
		var hurtParams = [hurtTween, unit, healthBar];

		Tweener.addTween(hurtTween, { health: battleStats.healthOutcome, time: 0.8, delay: 0, transition: "linear", onUpdate: updateHealth, onUpdateParams: hurtParams });
	}

	var onLayoutChanged = function (fightUnit, layoutData) {
		if (fightUnit.CFightUnit.direction == FightRenderer.DirectionType.Right) {
			var sprite = m_leftSprite;
		} else {
			var sprite = m_rightSprite;
		}

		var unitLayout = layoutData.directionalLayout[fightUnit.CFightUnit.direction];

		sprite.position(unitLayout.healthPosition.x, unitLayout.healthPosition.y);
		sprite.update();
	}
}

ECS.EntityManager.registerSystem('FightUnitHealthsController', FightUnitHealthsController);
SystemsUtils.supplySubscriber(FightUnitHealthsController);