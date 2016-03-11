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

	this.getPreviewState = function () {
		return m_previewState;
	}

	this.loadPreview = function (rawData) {

		var gameLoader = new GameLoader(m_previewState, m_eworld);

		gameLoader.load(rawData, function (fullGameState) {

			for(var i = 0; i < fullGameState.playersData.players.length; ++i) {
				fullGameState.playersData.setIsPlaying(fullGameState.playersData.players[i], false);
			}
		});

		// Avoid refreshing while loading.
		m_eworld.extract(GameWorldRenderer).refresh();
	}

	var init = function () {

		m_previewState = {
			playersData: null,
			gameState: null,
		};



		//
		// World
		//
		m_eworld = new ECS.EntityWorld();
		m_previewState.eworldSB = m_eworld.createSubscriber();

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

		var worldRenderer = GameWorldRenderer.Build(m_$GameWorldMap[0], m_eworld);
		m_eworld.store(GameWorldRenderer, worldRenderer);
	
		m_eworld.addSystem(new TileRenderingSystem(worldRenderer, false, false, false));
		m_eworld.addSystem(new UnitRenderingSystem(worldRenderer));
		m_eworld.addSystem(new TileStructureRenderingSystem(worldRenderer));
		m_eworld.addSystem(new AnimationSystem(worldRenderer));
		m_eworld.addSystem(new AnimationSystemScrollOptimizer(worldRenderer, m_eworld.getSystem(AnimationSystem)));
		m_eworld.addSystem(new LayersUpdateSystem(worldRenderer, WorldLayers.LayerTypes));
		m_eworld.addSystem(new CanvasInstancesUpdateSystem(worldRenderer, WorldLayers.LayerTypes));
		m_eworld.addSystem(new IdleAnimationsSystem(worldRenderer));

		m_previewState.worldRenderer = worldRenderer;
	}
	$(init);
};
