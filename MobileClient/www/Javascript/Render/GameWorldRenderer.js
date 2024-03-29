//===============================================
// GameWorldRenderer (Extends SceneRenderer)
// Specializes the rendering for GameWorld (tile based).
// Adds additional functions.
//===============================================
"use strict";

var GameWorldRenderer = new function () {

	this.Build = function (holderElement, eworld, scrollerOptions) {
		var renderer = new SceneRenderer(holderElement, eworld, WorldLayers);

		renderer.$pnScenePlot.addClass('game_scene_plot');
		renderer.backgroundColor = renderer.$pnScenePlot.css('background-color');

		renderer.viewWidth = 0;
		renderer.viewHeight = 0;

		// Overwrite methods
		var overwritten = {
			refresh: renderer.refresh,
			destroy: renderer.destroy,
		};

		renderer.refresh = function () {

			if (eworld.blackboard[EngineBlackBoard.Serialization.IS_LOADING])
				return;

			overwritten.refresh.apply(this);

			scrollerRefresh();

			onScreenResize();
		};

		renderer.destroy = function () {

			clearTimeout(scrollerRefreshTimeout);
			$(window).off('orientationchange', onScreenResize);
			$(window).off('resize', onScreenResize);
			renderer.plotContainerScroller.off('scrollStart', onScrollStart);
			renderer.plotContainerScroller.off('scrollEnd', onScrollEnd);
			renderer.plotContainerScroller.off('zoomStart', onZoomStart);
			renderer.plotContainerScroller.off('zoomEnd', onZoomEnd);
			renderer.plotContainerScroller.destroy();
			renderer.plotContainerScroller = null;

			overwritten.destroy();
		}


		$.extend(renderer, extension);



		//
		// Scroller stuff
		//

		// Refreshes scroller.
		// Give some time for DOM changes to be applied.
		var scrollerRefreshTimeout = null;
		var scrollerRefresh = function () {

			if (scrollerRefreshTimeout == null) {
				scrollerRefreshTimeout = setTimeout(function () {
					scrollerRefreshTimeout = null;
					renderer.plotContainerScroller.refresh();
				}, 200);
			}
		}


		var onScrollStart = function () {

			// Show everything for better scrolling.
			for(var name in renderer.spriteTracker.layerSprites) {
				var sprites = renderer.spriteTracker.layerSprites[name];
				
				for(var i = 0; i < sprites.length; ++i) {
					var sprite = sprites[i];

					// Optimization, avoid function call.
					var isCulled = (sprite._isCulled !== undefined) ? sprite._isCulled : true;

					if (!isCulled)
						sprite.cull(true);
				}
			}

		};

		var onScrollEnd = function () {
			var userZoom = renderer.plotContainerScroller.scale;

			var leftZoom = renderer.zoomIn(-renderer.plotContainerScroller.x) / userZoom;
			var topZoom = renderer.zoomIn(-renderer.plotContainerScroller.y) / userZoom;
			var rightZoom = leftZoom + renderer.zoomIn(renderer.viewWidth) / userZoom;
			var bottomZoom = topZoom + renderer.zoomIn(renderer.viewHeight) / userZoom;

			var leftNonZoom = -renderer.plotContainerScroller.x / userZoom;
			var topNonZoom = -renderer.plotContainerScroller.y / userZoom;
			var rightNonZoom = leftNonZoom + renderer.viewWidth / userZoom;
			var bottomNonZoom = topNonZoom + renderer.viewHeight / userZoom;
			

			// Cull only sprites inside the screen.
			for(var name in renderer.spriteTracker.layerSprites) {
				var sprites = renderer.spriteTracker.layerSprites[name];

				for(var i = 0; i < sprites.length; ++i) {
					var sprite = sprites[i];

					var disableZoom = sprite.layer.options.disableZoom;

					var left = (disableZoom) ? leftNonZoom : leftZoom;
					var top = (disableZoom) ? topNonZoom : topZoom;
					var right = (disableZoom) ? rightNonZoom : rightZoom;
					var bottom = (disableZoom) ? bottomNonZoom : bottomZoom;

					var anchorX = Math.round((sprite.anchorX || 0) * Math.abs(sprite.xscale));
					var anchorY = Math.round((sprite.anchorY || 0) * Math.abs(sprite.yscale));

					var shouldCull = 
						(sprite.x - anchorX + sprite.w >= left) &&
						(sprite.x - anchorX <= right) &&
						(sprite.y - anchorY + sprite.h >= top) &&
						(sprite.y - anchorY <= bottom);

					// Optimization, avoid function call.
					var isCulled = (sprite._isCulled !== undefined) ? sprite._isCulled : true;

					if (shouldCull != isCulled)
						sprite.cull(shouldCull);
				}
			}
		}

		var onZoomStart = function () {
			onScrollStart();
		}

		var onZoomEnd = function () {
			onScrollEnd();

			m_$zoomStats.text('Zoom: ' + renderer.plotContainerScroller.scale.toFixed(2));
		}


		var resizeRefreshTimeout = null;
		var onScreenResize = function () {

			clearTimeout(resizeRefreshTimeout);

			// Some time to redraw.
			resizeRefreshTimeout = setTimeout(function () {
				renderer.viewWidth = renderer.$pnScenePlot.width();
				renderer.viewHeight = renderer.$pnScenePlot.height();

				onScrollEnd();
			}, 100);
		}

		renderer.plotContainerScroller = new IScroll(renderer.$pnScenePlot[0], $.extend({
			freeScroll: true,
			keyBindings: true,
			mouseWheel: true,
			wheelAction: 'zoom',
			zoom: true,
			zoomMin: 0.75,
			zoomMax: 1.5,
			tap: true,
			scrollX: true,
			scrollY: true,
			scrollbars: (ClientUtils.isMockUp) ? true : false,
			fadeScrollbars: (ClientUtils.isMockUp) ? true : false,
			disableMouse: (ClientUtils.isMockUp) ? false : true,
			disablePointer: true,
			bounce: false,
			HWCompositing: true,
		}, scrollerOptions));

		renderer.plotContainerScroller.on('scrollStart', onScrollStart);
		renderer.plotContainerScroller.on('scrollEnd', onScrollEnd);

		renderer.plotContainerScroller.on('zoomStart', onZoomStart);
		renderer.plotContainerScroller.on('zoomEnd', onZoomEnd);

		$(window).on('orientationchange', onScreenResize);
		$(window).on('resize', onScreenResize);
		
		var m_$zoomStats = $('#ZoomStats');

		return renderer;
	};


	//
	// Extensions
	//
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

		// Make screenshot of the world onto the provided canvas (layer by layer).
		// Used for optimization, to avoid rendering the whole world when static.
		makeShot: function (targetCanvas, layersFilter) {
			var userZoom = this.plotContainerScroller.scale;

			// Get the viewport
			var viewX = this.zoomIn(-this.plotContainerScroller.x) / userZoom;
			var viewY = this.zoomIn(-this.plotContainerScroller.y) / userZoom;

			var canvasWidth = this.zoomIn(this.viewWidth) / userZoom;
			var canvasHeight = this.zoomIn(this.viewHeight) / userZoom;
			
			$(targetCanvas).attr('width', canvasWidth);
			$(targetCanvas).attr('height', canvasHeight);

			RenderUtils.transformSet(targetCanvas, 'scale(' + (DisplayManager.zoom * userZoom) + ')');

			$(targetCanvas).css('margin-left', Math.floor((this.viewWidth - canvasWidth) / 2));
			$(targetCanvas).css('margin-top', Math.floor((this.viewHeight - canvasHeight) / 2));


			//
			// Start shot
			//
			var targetCtx = targetCanvas.getContext("2d");

			targetCtx.fillStyle = this.backgroundColor;
			targetCtx.fillRect(0, 0, canvasWidth, canvasHeight);

			for(var i = 0; i < layersFilter.length; ++i) {
				var layer = this.layers[layersFilter[i]];

				if (layer.useCanvas)
					targetCtx.drawImage(layer.dom, viewX, viewY, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);

				if (layer.useCanvasInstance || !layer.useCanvas) {
					var sprites = this.spriteTracker.layerSprites[layer.name];

					if (!sprites)
						continue;

					for(var j = 0; j < sprites.length; ++j) {
						var sprite = sprites[j];

						if (sprite.skipDrawing)
							continue;

						if (!sprite.isShown())
							continue;


						// NOTE: This algorithm is mimicking the sprite.js method of rendering. Sync with that.
						var anchorX = (sprite.anchorX || 0) * Math.abs(sprite.xscale);
						var anchorY = (sprite.anchorY || 0) * Math.abs(sprite.yscale);

						// If scale is smaller, image is flipped, so anchor should be relative to the width/height.
						if (sprite.xscale < 0) anchorX = sprite.w - anchorX;
						if (sprite.yscale < 0) anchorY = sprite.h - anchorY;

						anchorX = Math.round(anchorX);
						anchorY = Math.round(anchorY);

						var offsetX = (layer.useCanvasInstance) ? 0 : sprite.xoffset;
						var offsetY = (layer.useCanvasInstance) ? 0 : sprite.yoffset;

						var dom = (layer.useCanvasInstance) ? sprite.canvasInstance : sprite.img;

						targetCtx.save();

						if (sprite.xTransformOrigin === null) {
							// HACK: if these are rounded, units with scaleX=-1 jump 1 pixel aside and causes visual bug?! Wtf?!
							//		 Sprite width must be odd number, like 55.
							var transx = sprite.w / 2 // | 0;
							var transy = sprite.h / 2 // | 0;
						} else {
							var transx = sprite.xTransformOrigin;
							var transy = sprite.yTransformOrigin;
						}

						targetCtx.translate(sprite._x_rounded + transx - viewX - anchorX, sprite._y_rounded + transy - viewY - anchorY);

						targetCtx.rotate(sprite.angle);
						if (sprite.xscale !== 1 || sprite.yscale !== 1)
							targetCtx.scale(sprite.xscale, sprite.yscale);

						targetCtx.globalAlpha = sprite.opacity;

						targetCtx.translate(-transx, -transy);

						targetCtx.drawImage(dom, offsetX, offsetY, sprite.w, sprite.h, 0, 0, sprite.w, sprite.h);

						targetCtx.restore();
					}
				}
			}
		}
	};
}