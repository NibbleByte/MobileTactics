//===============================================
// FightUnitStatsController
// Controls stats.
//===============================================
"use strict";

var FightUnitStatsController = function (m_renderer) {
	var self = this;
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		
		m_leftSprite = m_renderer.createSprite(FightRenderer.LayerTypes.Stats);
		m_rightSprite = m_renderer.createSprite(FightRenderer.LayerTypes.Stats);

		$(m_leftSprite.dom).addClass('fight_unit_stats_container');
		$(m_rightSprite.dom).addClass('fight_unit_stats_container');

		m_$leftStat.appendTo(m_leftSprite.dom);
		m_$rightStat.appendTo(m_rightSprite.dom);

		m_leftSprite.position(-1000, -1000);
		m_leftSprite.update();

		m_rightSprite.position(-1000, -1000);
		m_rightSprite.update();

		self._eworldSB.subscribe(FightRenderingEvents.Fight.INITIALIZE, onInitializeFight);
		self._eworldSB.subscribe(FightRenderingEvents.Fight.UNINITIALIZE, onUninitializeFight);

		self._eworldSB.subscribe(FightRenderingEvents.Units.UNIT_MOVED, onUnitMoved);
	}
	
	//
	// Private
	//
	var m_$leftStat = $('<span class="fight_unit_stats" />');
	var m_$rightStat = $('<span class="fight_unit_stats" />');
	var m_leftSprite = null;
	var m_rightSprite = null;

	var onInitializeFight = function () {
		var leftStats = self._eworld.blackboard[FightRenderingBlackBoard.Battle.LEFT_STATS];
		var rightStats = self._eworld.blackboard[FightRenderingBlackBoard.Battle.RIGHT_STATS];

		m_$leftStat.text('Strength: ' + leftStats.strength.toFixed(1));
		m_$rightStat.text('Strength: ' + rightStats.strength.toFixed(1));

		m_leftSprite.position(-1000, FightRenderingManager.FightFrame.top + FightUnitStatsController.TOP_OFFSET);
		m_leftSprite.update();

		m_rightSprite.position(-1000, FightRenderingManager.FightFrame.top + FightUnitStatsController.TOP_OFFSET);
		m_rightSprite.update();
	}

	var onUninitializeFight = function () {
		// Note: hide texts on uninitialize, because on slow devices can be seen on show up for a moment.
		m_leftSprite.position(-1000, m_leftSprite.y);
		m_leftSprite.update();

		m_rightSprite.position(-1000, m_rightSprite.y);
		m_rightSprite.update();
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

FightUnitStatsController.TOP_OFFSET = 100;

ECS.EntityManager.registerSystem('FightUnitStatsController', FightUnitStatsController);
SystemsUtils.supplySubscriber(FightUnitStatsController);