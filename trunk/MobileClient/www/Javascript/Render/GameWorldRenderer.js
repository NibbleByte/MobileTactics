//===============================================
// GameWorldRenderer (Extends SceneRenderer)
// Specializes the rendering for GameWorld (tile based).
// Adds additional functions.
//===============================================
"use strict";

var GameWorldRenderer = new function () {

	this.Build = function (holderElement, eworld, scrollerOptions) {
		var renderer = new SceneRenderer(holderElement, eworld, WorldLayers.LayerTypes, WorldLayers.layersOptions);

		// Overwrite methods
		var overwritten = {
			refresh: renderer.refresh,
			destroy: renderer.destroy,
		};

		renderer.refresh = function () {
			overwritten.refresh();

			scrollerRefresh();
		};

		renderer.destroy = function () {

			clearTimeout(scrollerRefreshTimeout);
			renderer.plotContainerScroller.destroy();
			renderer.plotContainerScroller = null;

			overwritten.destroy();
		}


		$.extend(renderer, extension);



		//
		// Scroller stuff
		//

		// Refreshes scroller. If sizes haven't fully initialized yet, it will refresh again after some time.
		// Some phones can't pick it up from the first time.
		var scrollerRefreshTimeout = null;	// Avoid firing multiple timeouts.
		var scrollerRefresh = function () {

			if (scrollerRefreshTimeout == null) {
				renderer.plotContainerScroller.refresh();

				// Check if scrolling is needed but not detected.
				if ((renderer.$pnScenePlot.width() < renderer.extentWidth && !renderer.plotContainerScroller.hasHorizontalScroll) ||
					(renderer.$pnScenePlot.height() < renderer.extentHeight && !renderer.plotContainerScroller.hasVerticalScroll)
					) {

					scrollerRefreshTimeout = setTimeout(function () {
						scrollerRefreshTimeout = null;
						scrollerRefresh();
					}, 200);
				}
			}
		}

		renderer.plotContainerScroller = new IScroll(renderer.$pnScenePlot[0], $.extend({
			freeScroll: true,
			keyBindings: true,
			mouseWheel: true,
			tap: true,
			scrollX: true,
			scrollY: true,
			scrollbars: (ClientUtils.isMockUp) ? true : false,
			fadeScrollbars: (ClientUtils.isMockUp) ? true : false,
			disableMouse: (ClientUtils.isMockUp) ? false : true,
			disablePointer: true,
			bounce: false,
			HWCompositing: false,
		}, scrollerOptions));


		return renderer;
	};

	
	var extension = {
		getRenderedTilePosition: function (row, column) {
		
			// http://www.redblobgames.com/grids/hexagons/#hex-to-pixel
			// basisX * column + basisY * row 
			var pos = GTile.TILE_BASIS_X.x(column).add( GTile.TILE_BASIS_Y.x(row) );
		
			return {
				x: pos.e(1) + GTile.LAYERS_PADDING,
				y: pos.e(2) + GTile.LAYERS_PADDING,
			};
		},
	
		getRenderedTileCenter: function (row, column) {
			var coords = this.getRenderedTilePosition(row, column);
		
			coords.x += GTile.TILE_WIDTH / 2;
			coords.y += GTile.TILE_HEIGHT / 2;
		
			return coords;
		},
	
		// Will use result obj if provided, instead of creating new one to return data.
		getTileCoordsAtPoint: function (x, y, result) {
		
			// Find Offset coordinates (based on rectangle approximation)
			var rectRow = Math.floor(y / GTile.TILE_VOFFSET);
			var rectColumn = Math.floor( (x - (rectRow % 2) * GTile.TILE_HOFFSET) / GTile.TILE_WIDTH );
		
			// Used conversion: http://www.redblobgames.com/grids/hexagons/#conversions
			// Modified to use it with the current coordinate system.
			var cubeY = rectColumn + (rectRow + (rectRow & 1)) / 2;
			var cubeZ = rectRow;
		
		
			// x,y offset relative to rectangle tile.
			var localX = x - rectColumn * GTile.TILE_WIDTH - (rectRow % 2) * GTile.TILE_HOFFSET;
			var localY = y - rectRow * GTile.TILE_VOFFSET;
		
			// Find if clicked over this hex, or the adjacent top left/right one.
		
			// Use a line equation imitating the /\ form of the top of the hex.
			// Similar to: http://www.gdreflections.com/2011/02/hexagonal-grid-math.html
			var isInside = localY > -GTile.TILE_SIDE_SLOPE * Math.abs(GTile.TILE_WIDTH / 2 - localX);		
			if (!isInside) {
				--cubeZ;
			
				if (localX < GTile.TILE_WIDTH / 2) {
					--cubeY;
				}
			}
		
			// Fill user object instead.
			if (result) {
				result.row = cubeZ;
				result.column = cubeY;
				return result;
			}

			return {
				row: cubeZ,
				column: cubeY
			}
		},

		getRenderedRows: function () {
			return Math.round((this.extentHeight - GTile.LAYERS_PADDING * 2 - (GTile.TILE_HEIGHT - GTile.TILE_VOFFSET)) / GTile.TILE_VOFFSET);
		},

		getRenderedColumns: function () {

			if (this.getRenderedRows() == 1) {
				return Math.round((this.extentWidth - GTile.LAYERS_PADDING * 2) / GTile.TILE_WIDTH);
			} else {
				return Math.round((this.extentWidth - GTile.LAYERS_PADDING * 2 - GTile.TILE_HOFFSET) / GTile.TILE_WIDTH);
			}
		},
	};
}