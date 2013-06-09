"use strict";

var CUnitRendering = function (go_this) {
	var self = this;
	
	// 
	// Private
	//
	var clearRender = function () {
		m_$renderedHolder.detach();
	}
	
	//
	// Public messages
	//
	this.UMessage('getPlaceableLayer', function () {
		return WorldLayers.LayerTypes.Units;
	});
	
	this.MMessage('renderAttach', function (worldLayers) {
		worldLayers.attachTo(WorldLayers.LayerTypes.Statistics, m_$renderedHolder);
	});
	
	this.UMessage('tile', function tileMsg(tile) {
		// Move rendered object to new tile.
		if (tile) {
			var coords = tile.getRenderedCenterXY();
			m_$renderedHolder
			.css('top', coords.y)
			.css('left', coords.x);
		}
		
		
		return self.getNextBid(go_this, tileMsg)(tile);
	}, 8);
	
	
	this.MMessage('clearRender', clearRender);
	this.MMessage('destroy', clearRender);
	
	
	
	this.UMessage('health', function healthMsg(health) {
		
		var newHealth = self.getNextBid(go_this, healthMsg)(health);
		
		m_$renderedHealth.text(newHealth.toPrecision(2));
		
		return newHealth
	}, 10);
	
	
	this.MMessage('finalyzeAdd', function () {
		m_$renderedHealth.text(go_this.health().toPrecision(2));		 
	});
	
	// 
	// Private
	//
	var m_$renderedHolder = $('<div class="placeable" />');
	var m_$renderedHealth = $('<span class="unit_health" />')
	.appendTo(m_$renderedHolder)
};

EntityManager.registerComponent('CUnitRendering', CUnitRendering);
EntityManager.addComponentDependencies(CUnit, CUnitRendering);