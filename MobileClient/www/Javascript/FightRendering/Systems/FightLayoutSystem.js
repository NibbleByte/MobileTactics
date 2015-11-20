//===============================================
// FightLayoutSystem
// Controls the layout of the fight elements (and their sizes).
//===============================================
"use strict";

var FightLayoutSystem = function (m_renderer) {
	var self = this;

	var m_layoutData = new FightLayoutData(m_renderer);
	
	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._eworldSB.subscribe(FightRenderingEvents.Layout.REFRESH_UNIT_LAYOUT, onRefreshUnitLayout);

		self._eworld.blackboard[FightRenderingBlackBoard.Layout.LAYOUT_DATA] = m_layoutData;
	}
	
	//
	// Private
	//

	var onRefreshUnitLayout = function (fightUnit) {
		
		var unitLayout = m_layoutData.directionalLayout[fightUnit.CFightUnit.direction];
		var pos = fightUnit.CSpatial;

		var halfOuterSpaceHorizontal = (m_renderer.extentWidth - FightRenderingManager.FIGHT_FRAME_WIDTH) / 2;

		if (fightUnit.CFightUnit.direction == FightRenderer.DirectionType.Right) {

			unitLayout.unitShowUpPosition.x = FightRenderingManager.FightFrame.left + m_layoutData.UNIT_BOX_WIDTH / 2;
			unitLayout.unitShowUpPosition.y = FightRenderingManager.FightFrame.top + m_layoutData.UNIT_BOX_HEIGHT - m_layoutData.GROUND_BOTTOM_CENTER;

			unitLayout.unitHideOutPosition.x = pos.x - FightRenderingManager.FIGHT_FRAME_WIDTH - halfOuterSpaceHorizontal;
			unitLayout.unitHideOutPosition.y = unitLayout.unitShowUpPosition.y;

			var right = pos.x - m_layoutData.UNIT_BOX_WIDTH / 2 + FightRenderingManager.FIGHT_FRAME_WIDTH;
			unitLayout.portraitCenter.x = right - m_layoutData.PORTRAIT_WIDTH / 2;
			unitLayout.portraitCenter.y = pos.y - m_layoutData.UNIT_BOX_HEIGHT + m_layoutData.GROUND_BOTTOM_CENTER;
			unitLayout.portraitCenter.y += m_layoutData.PORTRAIT_HEIGHT / 2;

			unitLayout.healthPosition.x = right;
			unitLayout.healthPosition.y = unitLayout.portraitCenter.y + m_layoutData.PORTRAIT_HEIGHT / 2;

			unitLayout.statsPosition.x = pos.x;
			unitLayout.statsPosition.y = pos.y + m_layoutData.GROUND_BOTTOM_CENTER;

		} else {
			unitLayout.unitShowUpPosition.x = FightRenderingManager.FightFrame.right - m_layoutData.UNIT_BOX_WIDTH / 2;
			unitLayout.unitShowUpPosition.y = FightRenderingManager.FightFrame.bottom - m_layoutData.GROUND_BOTTOM_CENTER;

			unitLayout.unitHideOutPosition.x = pos.x + FightRenderingManager.FIGHT_FRAME_WIDTH + halfOuterSpaceHorizontal;
			unitLayout.unitHideOutPosition.y = unitLayout.unitShowUpPosition.y;
			
			var left = pos.x + m_layoutData.UNIT_BOX_WIDTH / 2 - FightRenderingManager.FIGHT_FRAME_WIDTH;
			unitLayout.portraitCenter.x = left + m_layoutData.PORTRAIT_WIDTH / 2;
			unitLayout.portraitCenter.y = pos.y + m_layoutData.GROUND_BOTTOM_CENTER - m_layoutData.PORTRAIT_HEIGHT;
			unitLayout.portraitCenter.y += m_layoutData.PORTRAIT_HEIGHT / 2;
			unitLayout.portraitCenter.y -= m_layoutData.HEALTHBAR_HEIGHT;

			unitLayout.healthPosition.x = left;
			unitLayout.healthPosition.y = unitLayout.portraitCenter.y + m_layoutData.PORTRAIT_HEIGHT / 2;

			unitLayout.statsPosition.x = pos.x;
			unitLayout.statsPosition.y = pos.y + m_layoutData.GROUND_BOTTOM_CENTER;
		}

		self._eworld.trigger(FightRenderingEvents.Layout.LAYOUT_CHANGED, fightUnit, m_layoutData);
	}
}

var FightLayoutData = function (m_renderer) {

	this.UNIT_BOX_WIDTH = m_renderer.zoomIn(180);
	this.UNIT_BOX_HEIGHT = m_renderer.zoomIn(170);
	this.GROUND_BOTTOM_CENTER = m_renderer.zoomIn(24);

	this.PORTRAIT_WIDTH = m_renderer.zoomIn(70);
	this.PORTRAIT_HEIGHT = m_renderer.zoomIn(70);

	this.HEALTHBAR_HEIGHT = m_renderer.zoomIn(22);

	this.STATS_HEIGHT = m_renderer.zoomIn(20);

	this.directionalLayout = {};

	this.directionalLayout[FightRenderer.DirectionType.Left] = {
		unitShowUpPosition:		{ x: -1000, y: -1000 },
		unitHideOutPosition:	{ x: -1000, y: -1000 },
		portraitCenter:			{ x: -1000, y: -1000 },
		healthPosition:			{ x: -1000, y: -1000 },
		statsPosition:			{ x: -1000, y: -1000 },
	};

	this.directionalLayout[FightRenderer.DirectionType.Right] = $.extend(true, {}, this.directionalLayout[FightRenderer.DirectionType.Left]);
}

ECS.EntityManager.registerSystem('FightLayoutSystem', FightLayoutSystem);
SystemsUtils.supplySubscriber(FightLayoutSystem);