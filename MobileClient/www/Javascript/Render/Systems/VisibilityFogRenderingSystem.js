//===============================================
// VisibilityFogRenderingSystem
// Deals with the visibility fog.
//===============================================
"use strict";

var VisibilityFogRenderingSystem = function (m_world, m_visibilitySystem) {
	var self = this;
	
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADING, onGameLoading);
		self._eworldSB.subscribe(GameplayEvents.GameState.VIEWER_CHANGED, refreshFog);
		self._eworldSB.subscribe(EngineEvents.Placeables.PLACEABLE_MOVED, refreshFogIfCurrentPlayer);
		self._eworldSB.subscribe(EngineEvents.Placeables.PLACEABLE_UNREGISTERED, refreshFog);
		self._eworldSB.subscribe(EngineEvents.World.TILE_ADDED, onTileAdded);
		self._eworldSB.subscribe(EngineEvents.World.TILE_REMOVED, refreshFog);
		self._eworldSB.subscribe(GameplayEvents.Structures.OWNER_CHANGED, refreshFog);

		self._eworldSB.subscribe(GameplayEvents.Visibility.FORCE_VISIBILITY_REFRESH, refreshFogIfCurrentPlayer);
	}

	//
	// Private
	//

	var m_gameState = null;
	var m_playersData = null;
	var m_fogOfWarAllowed = true;

	var onGameLoading = function () {
		m_gameState = self._eworld.extract(GameState);
		m_playersData = self._eworld.extract(PlayersData);

		m_fogOfWarAllowed = m_gameState.fogOfWar;

		// DEBUG: For testing AI movements.
		if (ClientUtils.urlParams['NoFogRendering'])
			m_fogOfWarAllowed = false;
	}

	var onTileAdded = function (tile) {

		if (self._eworld.blackboard[EngineBlackBoard.Serialization.IS_LOADING])
			return;

		if (!m_fogOfWarAllowed)
			TileRenderingSystem.setTileVisibilityFog(tile, false);

		if (m_gameState && m_gameState.viewerPlayer)
			refreshFog();
	}

	var showFog = function (tile) {
		TileRenderingSystem.setTileVisibilityFog(tile, true);
	}

	var hideFog = function (tile) {
		TileRenderingSystem.setTileVisibilityFog(tile, false);
	}

	var hideFogs = function (tiles) {
		for (var j = 0; j < tiles.length; ++j) {
			TileRenderingSystem.setTileVisibilityFog(tiles[j], false);
		}
	}
	
	var refreshFogIfCurrentPlayer = function () {

		if (self._eworld.blackboard[EngineBlackBoard.Serialization.IS_LOADING])
			return;

		if (m_gameState.currentPlayer == m_gameState.viewerPlayer) {
			refreshFog();
		}
	}

	var refreshFog = function () {

		if (!m_fogOfWarAllowed) {
			self._eworld.triggerAsync(RenderEvents.Fog.REFRESH_FOG);
			return;
		}


		if (!m_gameState.hasGameFinished()) {

			m_world.iterateAllTiles(showFog);

			if (m_gameState.viewerPlayer) {
			
				var visibleTiles = m_visibilitySystem.findPlayerVisibility(m_gameState.viewerPlayer);
			
				hideFogs(visibleTiles);
			}

		} else {
			m_world.iterateAllTiles(hideFog);
			
		}

		self._eworld.triggerAsync(RenderEvents.Fog.REFRESH_FOG);
	}

}

ECS.EntityManager.registerSystem('VisibilityFogRenderingSystem', VisibilityFogRenderingSystem);
SystemsUtils.supplySubscriber(VisibilityFogRenderingSystem);