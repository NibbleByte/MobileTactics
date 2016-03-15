//===============================================
// MapPreviewMaker
// 
//===============================================
"use strict";

var MapPreviewMaker = function (m_element) {
	var self = this;

	var m_$GameWorldMap = $(m_element);
	var m_previewState = null;
	var m_eworld = null;

	var m_$previewLoadTime = $('#MapSelectorPreviewLoadingTime');

	this.getPreviewState = function () {
		return m_previewState;
	}

	this.loadPreview = function (rawData) {
		
		var start = new Date().getTime();

		var gameLoader = new GameLoader(m_previewState, m_eworld);

		gameLoader.load(rawData);

		var loaded = new Date().getTime();

		// Avoid refreshing while loading.
		var renderer = m_eworld.extract(GameWorldRenderer)
		renderer.refresh();

		var zoomOutScale = Math.min(renderer.viewWidth / renderer.extentWidth, renderer.viewHeight / renderer.extentHeight);
		if (zoomOutScale == 0) zoomOutScale = 0.5;	// HACK: Because first time elements haven't been shown and don't have sizes.

		renderer.plotContainerScroller.zoom(zoomOutScale, undefined, undefined, 0);


		var end = new Date().getTime();
		m_$previewLoadTime.text('t: ' + (loaded - start) + ', ' + (end - loaded));
	}

	this.cleanUp = function () {

		if (m_previewState) {
			m_previewState.gameState = null;
			m_previewState.playersData = null;
			m_previewState.gameMetaData = null;
			
			m_previewState.eworld.destroy();
			m_previewState.worldRenderer.destroy();
			m_previewState = null;
		}
	}

	this.setup = function () {

		m_previewState = {
			playersData: null,
			gameState: null,
			gameMetaData: null,
		};



		//
		// World
		//
		m_eworld = new ECS.EntityWorld();

		m_previewState.eworld = m_eworld;
	
		m_eworld.addSystem(m_eworld.store(UtilsSystem, new UtilsSystem()));

		//
		// World systems
		//
		var world = new GameWorld();
		m_eworld.addSystem(world);
		m_eworld.store(GameWorld, world);
		m_previewState.world = world;
	
		//
		// Gameplay Systems
		//
		m_eworld.addSystem(new UnitsSystem());
		m_eworld.addSystem(new GameStateSystem());
		m_eworld.addSystem(new TileStructuresSystem());


		//
		// Rendering Systems
		//

		var worldRenderer = GameWorldRenderer.Build(m_$GameWorldMap[0], m_eworld, {
			zoomMin: 0.3,
		});
		m_eworld.store(GameWorldRenderer, worldRenderer);
	
		m_eworld.addSystem(new TileRenderingSystem(worldRenderer, false, false, false));
		m_eworld.addSystem(new UnitRenderingSystem(worldRenderer, true));
		m_eworld.addSystem(new TileStructureRenderingSystem(worldRenderer));
		m_eworld.addSystem(new AnimationSystem(worldRenderer));
		m_eworld.addSystem(new AnimationSystemScrollOptimizer(worldRenderer, m_eworld.getSystem(AnimationSystem)));
		m_eworld.addSystem(new LayersUpdateSystem(worldRenderer, WorldLayers.LayerTypes));
		m_eworld.addSystem(new CanvasInstancesUpdateSystem(worldRenderer, WorldLayers.LayerTypes));
		m_eworld.addSystem(new IdleAnimationsSystem(worldRenderer));

		m_previewState.worldRenderer = worldRenderer;
	}
};
