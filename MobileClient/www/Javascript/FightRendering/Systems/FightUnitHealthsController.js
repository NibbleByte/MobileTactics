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

		$(m_leftSprite.dom).addClass('fight_unit_stats_container');
		$(m_rightSprite.dom).addClass('fight_unit_stats_container');

		m_leftHealthBar = new FightHealthBar(m_leftSprite.dom, FightRenderer.DirectionType.Right);
		m_rightHealthBar = new FightHealthBar(m_rightSprite.dom, FightRenderer.DirectionType.Left);

		m_leftSprite.position(-1000, -1000);
		m_leftSprite.update();
		
		m_rightSprite.position(-1000, -1000);
		m_rightSprite.update();


		self._eworldSB.subscribe(FightRenderingEvents.Fight.INITIALIZE, onInitializeFight);
		self._eworldSB.subscribe(FightRenderingEvents.Fight.UNINITIALIZE, onUninitializeFight);

		self._eworldSB.subscribe(FightRenderingEvents.Animations.HURT, onHurt);

		self._eworldSB.subscribe(FightRenderingEvents.Units.UNIT_MOVED, onUnitMoved);
	}
	
	//
	// Private
	//
	var m_leftHealthBar = null;
	var m_rightHealthBar = null;
	var m_leftSprite = null;
	var m_rightSprite = null;

	var onInitializeFight = function () {
		
		m_leftSprite.position(-1000, FightRenderingManager.FightFrame.bottom - FightControllerSystem.BOTTOM_OFFSET + FightUnitHealthsController.BOTTOM_OFFSET);
		m_leftSprite.update();

		m_rightSprite.position(-1000, FightRenderingManager.FightFrame.bottom - FightControllerSystem.BOTTOM_OFFSET + FightUnitHealthsController.BOTTOM_OFFSET);
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
		m_leftSprite.position(-1000, m_leftSprite.y);
		m_leftSprite.update();

		m_rightSprite.position(-1000, m_rightSprite.y);
		m_rightSprite.update();
	}

	var updateHealth = function (tween, unit, healthBar) {

		// On changing screen size causes restart of the fight and units get destroyed.
		// Tweener might still be executing, so just do nothing.
		if (Utils.isInvalidated(unit))
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

	var onUnitMoved = function (fightUnit) {
		if (fightUnit.CFightUnit.state != FightUnitState.ShowingUp)
			return;

		var sprite = m_leftSprite;
		if (fightUnit.CFightUnit.direction == FightRenderer.DirectionType.Left) {
			sprite = m_rightSprite;
		}

		sprite.position(fightUnit.CSpatial.x, sprite.y);
		sprite.update();
	}
}

FightUnitHealthsController.BOTTOM_OFFSET = 20;

ECS.EntityManager.registerSystem('FightUnitHealthsController', FightUnitHealthsController);
SystemsUtils.supplySubscriber(FightUnitHealthsController);