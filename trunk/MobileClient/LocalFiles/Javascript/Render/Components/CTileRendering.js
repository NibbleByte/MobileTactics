"use strict";

var CTileRendering = function (go_this) {
	var self = this;
	
	// 
	// Private
	//
	var clearRender = function () {
		m_$renderedTile.detach();
	}
	
	
	//
	// Public messages
	//	
	this.MMessage('renderAttach', function (worldLayers) {
		var row = go_this.row();
		var column = go_this.column();
		
		var hOffset = (column % 2) ? GTile.TILE_HOFFSET : 0;
		var vOffset = (column % 2) ? -GTile.TILE_VOFFSET : 0;
		
		var x = hOffset + Math.floor(column / 2) * (GTile.TILE_WIDTH + GTile.TILE_SIDE);
		var y = vOffset + (row - Math.floor(column / 2)) * GTile.TILE_HEIGHT;
		
		worldLayers.attachTo(WorldLayers.LayerTypes.Terrain,
			m_$renderedTile
			.css('left', x + GTile.LAYERS_PADDING + 'px')
			.css('top', y + GTile.LAYERS_PADDING + 'px')
		);
		
		/////////////////////////////////////////////////////////
		// DEBUG: Debug visualization
		
		m_$renderedTile
		.html(	'<br />' +
				'RC: ' + row + ', ' + column +
				'<br />' +
				'X: ' + parseInt(m_$renderedTile.css('left')) +
				'<br />' +
				'Y: ' + parseInt(m_$renderedTile.css('top')));
		// DEBUG: Color every even column
		if (row % 2)
			m_$renderedTile
			.css('background', 'url("Assets/Render/Images/hex_bluesh.png") no-repeat')
			.css('background-size', '100% 100%');
	});
	
	this.UMessage('getRenderedTile', function () {
		return m_$renderedTile;
	});
	
	this.UMessage('getRenderedXY', function () {
		return {
				y: parseFloat(m_$renderedTile.css('top')),
				x: parseFloat(m_$renderedTile.css('left'))
				};
	});
	
	this.UMessage('getRenderedCenterXY', function () {
		return {
				y: parseFloat(m_$renderedTile.css('top')) + GTile.TILE_HEIGHT / 2,
				x: parseFloat(m_$renderedTile.css('left')) + GTile.TILE_WIDTH / 2
				};
	});
	
	
	this.UMessage('unSelect', function () {
		$(m_$renderedTile).removeClass(CLASSES.TILE_SELECTED);
	});
	
	this.UMessage('select', function () {
		$(m_$renderedTile).addClass(CLASSES.TILE_SELECTED);
	});
	
	this.UMessage('isSelected', function () {
		return $(m_$renderedTile).hasClass(CLASSES.TILE_SELECTED);
	});
	
	this.MMessage('clearRender', clearRender);
	this.MMessage('destroy', clearRender);
	
	//
	// Tiles
	//
	// TODO: Move to static
	var CLASSES = {
			TILE_SELECTED: 'tile_selected',
	}
	
	//
	// Private
	//
	var m_$renderedTile = $('<div class="tile"></div>');
};

EntityManager.registerComponent('CTileRendering', CTileRendering);
EntityManager.addComponentDependencies(CTile, CTileRendering);