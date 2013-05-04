"use strict";

var CTilePlaceableRendering = function (go_this) {
	var self = this;
	
	this.UMessage('renderAttach', function (worldLayers) {
		
		worldLayers.attachTo(WorldLayers.LayerTypes.Units, m_$renderedElement);
		
		m_isRendered = true;
		
		go_this.skin(m_skin);
				
		return m_$renderedElement;
	});
	
	this.UMessage('tile', function tileMsg(tile) {
		// Move rendered object to new tile.
		if (tile) {
			var coords = tile.getRenderedXY();
			m_$renderedElement
			.css('top', coords.y + GTile.TILE_HEIGHT / 2)
			.css('left', coords.x + GTile.TILE_WIDTH / 2);
		}
		
		
		return self.getNextBid(go_this, tileMsg)(tile);
	}, 10);
	
	// Setter/getter
	this.UMessage('skin', function (skin) {
		if (skin != undefined) {
			m_skin = skin;
			
			// Needed, because image has no width/height if not attached to DOM.
			if (m_isRendered) {
				m_$image 
				.hide()
				.attr("src","Assets/Render/Images/" + m_skin + ".png");
			}
			
		} else {
			return m_skin;
		}
	});
	
	this.UMessage('clearRender', function () {
		m_$renderedElement.detach();
		m_isRendered = false;
	});
		
	this.MMessage('destroy', function () {
		go_this.clearRender(); 
	});
	
	//
	// Private
	//
	var m_isRendered = false;
	var m_$renderedElement = $('<div class="placeable" />');
	var m_$image = $('<img class="placeable_image" />')
		.appendTo(m_$renderedElement)
		// TODO: Having handlers on each object placed on map, might be slow.
		.load(function() {
			m_$image.css('left', -m_$image.width() / 2);
			m_$image.css('top', -m_$image.height() / 2);
			m_$image.show();
	    });
	var m_skin = '';
};

EntityManager.registerComponent('CTilePlaceableRendering', CTilePlaceableRendering);
EntityManager.addComponentDependencies(CTilePlaceable, CTilePlaceableRendering);