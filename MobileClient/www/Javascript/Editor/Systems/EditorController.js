//===============================================
// EditorController
// User control in the editor.
//===============================================
"use strict";

var EditorController = function (m_world, m_renderer) {
	var self = this;

	var m_$TerrainBrushList = $('#SelTerrainEditor');
	var m_$PlaceablesBrushList = $('#SelPlaceablesEditor');
	var m_$PlayerBrushList = $('#SelPlayerEditor');

	var m_currentBrush = null;
	
	var m_subscriber = new DOMSubscriber();
	var m_gameState = null;
	var m_playersData = null;

	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._eworld.getSystem(TileRenderingSystem).enableDetailedInputEvents();
		self._eworldSB.subscribe(ClientEvents.Input.TILE_TOUCH, onTileTouched);
		self._eworldSB.subscribe(ClientEvents.Input.TILE_TOUCH_UP, onTileTouchedEnd);

		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADING, onGameLoading);
		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADED, onGameLoaded);
		self._eworldSB.subscribe(EditorEvents.Properties.GAME_PROPERTIES_CHANGED, onGamePropsChanged);

		// Toolbar listeners
		m_subscriber.subscribe($('#BtnPanEditor'), 'click', onBtnPan);
		m_subscriber.subscribe($('#BtnTerrainEditor'), 'click', onBtnTerrain);
		m_subscriber.subscribe($('#BtnPlaceablesEditor'), 'click', onBtnPlaceables);

		m_subscriber.subscribe(m_$TerrainBrushList, 'change', onTerrainBrushListChange);
		m_subscriber.subscribe(m_$PlaceablesBrushList, 'change', onPlaceablesBrushListChange);
		m_subscriber.subscribe(m_$PlayerBrushList, 'change', onPlayerBrushListChange);

		self._eworldSB.subscribe(EngineEvents.General.GAME_LOADING, rebuildPlayersList);

		self._eworldSB.subscribe(GameplayEvents.Players.PLAYER_ADDED, onPlayersChanged);
		self._eworldSB.subscribe(GameplayEvents.Players.PLAYER_REMOVED, onPlayerRemoved);
	};
	
	this.uninitialize = function () {
		m_subscriber.unsubscribeAll();
	};

	// Set the world size.
	// If world is smaller than previous size, it removes those tiles.
	this.setWorldSize = function (erase, rows, columns) {
		if (erase)
			m_world.clearTiles();

		var oldRows = m_renderer.getRenderedRows();
		var oldColumns = m_renderer.getRenderedColumns();
		var maxRows = Math.max(oldRows, rows);
		var maxColumns = Math.max(oldColumns, columns);

		for (var i = 0; i < maxRows; ++i) {
			for (var j = Math.ceil(i / 2); j < maxColumns + i / 2; ++j) {

				if (i < rows && j < columns + i / 2) {

					// If tile already exists skip it.
					if (!erase && m_world.getTile(i, j))
						continue;

					var tile = GameWorld.createTileUnmanaged(GameWorldTerrainType.None, i, j);

					self._eworld.addUnmanagedEntity(tile);
				} else {
					// Remove anything outside the requested size.
					var tile = m_world.getTile(i, j);
					if (tile)
						tile.destroy();
				}
			}
		}
	}

	var onGameLoading = function () {
		m_gameState = self._eworld.extract(GameState);
		m_playersData = self._eworld.extract(PlayersData);
	}

	var onGameLoaded = function () {
		rebuildTerrainBrushList();
		rebuildUnitsList();
		onBtnPan();
	}

	var onGamePropsChanged = function (width, height) {

		self.setWorldSize(false, width, height);

		rebuildUnitsList();

		// If map is custom, remove all redundant units.
		var entities = self._eworld.getEntities();

		for (var i = 0; i < entities.length; ++i) {
			var entity = entities[i];

			if (entity.CUnit && !GenericUnits.contains(entity.CUnit.getDefinition())) {
				entity.destroy();
				--i;
			}
		}
	}

	var rebuildTerrainBrushList = function () {
		m_$TerrainBrushList.empty();

		for (var name in GameWorldTerrainType) {
			$('<option />')
			.attr('value', GameWorldTerrainType[name])
			.text(name)
			.prop('selected', GameWorldTerrainType[name] == GameWorldTerrainType.Plains )
			.appendTo(m_$TerrainBrushList);
		}
	}

	var rebuildUnitsList = function () {
		m_$PlaceablesBrushList.empty();

		// Generic games allow only basic unit to be placed.
		if (!m_gameState.isCustomMap) {
			$('<option />')
			.text('Race Basic Unit')
			.attr('value', UnitsFactory.generateDefinitionPath(UnitsDefinitions[Player.Races.Empire].PeaceKeeper))
			.appendTo(m_$PlaceablesBrushList);

			return;
		}


		for (var i = 0; i < UnitsDefinitions.length; ++i) {

			$('<option />')
			.attr('disabled', 'disabled')
			.text('> ' + Enums.getName(Player.Races, i) + ' <')
			.appendTo(m_$PlaceablesBrushList);

			for (var key in UnitsDefinitions[i]) {
				$('<option />')
				.attr('value', UnitsFactory.generateDefinitionPath(i, key))
				.text(key)
				.appendTo(m_$PlaceablesBrushList);
			}
		}

		// HACK: Mobile browsers fail and select the disabled element... go figure...
		m_$PlaceablesBrushList.children(':enabled').first().prop('selected', true );
	}

	var rebuildPlayersList = function () {
		m_$PlayerBrushList.empty();

		$('<option />')
		.attr('value', '-')
		.text('Neutral')
		.appendTo(m_$PlayerBrushList);
		
		for(var i = 0; i < m_playersData.players.length; ++i) {
			$('<option />')
			.attr('value', i)
			.text('Player ' + (i + 1))
			.appendTo(m_$PlayerBrushList);
		}
	}

	var changeBrush = function (brush) {
		if (m_currentBrush && m_currentBrush.destroy) {
			m_currentBrush.destroy();
		}

		m_currentBrush = brush;

		self._eworld.blackboard[EditorBlackBoard.Brushes.CURRENT_BRUSH] = m_currentBrush;
		self._eworld.trigger(EditorEvents.Brushes.ACTIVE_BRUSH_CHANGED, m_currentBrush);
	}



	var onBtnPan = function (event) {
		m_$TerrainBrushList.hide();
		m_$PlayerBrushList.hide();
		m_$PlaceablesBrushList.hide();

		changeBrush(null);
		m_renderer.plotContainerScroller.enable();
	}

	var onBtnTerrain = function (event) {
		m_$TerrainBrushList.show();
		m_$PlayerBrushList.show();
		m_$PlaceablesBrushList.hide();

		m_$PlayerBrushList.find('option[value="-"]').removeAttr('disabled');

		if (m_$PlayerBrushList.val() == '-') {
			var player = null;
		} else {
			var player = m_playersData.players[parseInt(m_$PlayerBrushList.val())];
		}

		changeBrush(new TerrainBrush(self._eworld, m_world,
			parseInt(m_$TerrainBrushList.val()),
			player
		));

		m_renderer.plotContainerScroller.disable();
	}

	var onBtnPlaceables = function (event) {
		m_$TerrainBrushList.hide();
		m_$PlayerBrushList.show();
		m_$PlaceablesBrushList.show();

		m_$PlayerBrushList.find('option[value="-"]').attr('disabled', 'disabled');


		changeBrush(new UnitsBrush(self._eworld, m_world, 
			UnitsFactory.resolveDefinitionPath(m_$PlaceablesBrushList.val()),
			m_playersData.players[parseInt(m_$PlayerBrushList.val())]
		));

		if (!m_$PlayerBrushList.val() || m_$PlayerBrushList.val() == '-') m_$PlayerBrushList.val('0').change();

		m_renderer.plotContainerScroller.disable();
	}

	var onTerrainBrushListChange = function () {
		if (Utils.assert(m_currentBrush instanceof TerrainBrush))
			return;

		m_currentBrush.terrainType = parseInt(m_$TerrainBrushList.val());
		m_currentBrush.player = m_playersData.players[parseInt(m_$PlayerBrushList.val())];

		self._eworld.trigger(EditorEvents.Brushes.ACTIVE_BRUSH_MODIFIED, m_currentBrush);
	}

	var onPlaceablesBrushListChange = function () {
		if (Utils.assert(m_currentBrush instanceof UnitsBrush))
			return;

		m_currentBrush.unitDefinition = UnitsFactory.resolveDefinitionPath(m_$PlaceablesBrushList.val());
		m_currentBrush.player = m_playersData.players[parseInt(m_$PlayerBrushList.val())];

		self._eworld.trigger(EditorEvents.Brushes.ACTIVE_BRUSH_MODIFIED, m_currentBrush);
	}

	var onPlayerBrushListChange = function () {
		if (m_currentBrush instanceof UnitsBrush)
			onPlaceablesBrushListChange();
		else
			onTerrainBrushListChange();
	}

	var lastTouchRow = null;
	var lastTouchColumn = null;
	var onTileTouched = function (hitData) {
		
		if (m_currentBrush && (lastTouchRow != hitData.row || lastTouchColumn != hitData.column)) {
			lastTouchRow = hitData.row;
			lastTouchColumn = hitData.column;

			m_currentBrush.place(hitData.row, hitData.column, hitData.tile);

			
			//
			// Auto-resize if placing on the edge
			//
			var rows = m_renderer.getRenderedRows();
			var columns = m_renderer.getRenderedColumns();

			var resizeHorizontal = hitData.column == columns + Math.ceil(hitData.row / 2) - 1;
			var resizeVertical = hitData.row == rows - 1;

			if (hitData.tile && !self._eworld.extract(EditorState).mapLockedSizes) {
				if (resizeHorizontal || resizeVertical) {
					self.setWorldSize(false, 
						(resizeVertical) ? rows + 2 : rows, 
						(resizeHorizontal) ? columns + 2 : columns
					);
				}
			}

			self._eworld.triggerAsync(RenderEvents.Layers.REFRESH_ALL);
		}


		// Auto-scroll when touching near the edges. A bit hacky, so shoot me.
		if (window.event) {
			var plotPos = m_renderer.$pnScenePlot.offset();
			var shouldRefresh = false;

			var pointerEvent = window.event;
			if (ClientUtils.isTouchDevice) {
				pointerEvent = pointerEvent.touches[0] || pointerEvent.changedTouches[0];
			}

			if (pointerEvent.clientX < plotPos.left + +30) {
				m_renderer.plotContainerScroller.scrollBy(10, 0);
				shouldRefresh = true;
			}
			if (pointerEvent.clientY < plotPos.top + +30) {
				m_renderer.plotContainerScroller.scrollBy(0, 10);
				shouldRefresh = true;
			}
			if (pointerEvent.clientX > plotPos.left + m_renderer.$pnScenePlot.width() - 30) {
				m_renderer.plotContainerScroller.scrollBy(-10, 0);
				shouldRefresh = true;
			}
			if (pointerEvent.clientY > plotPos.top + m_renderer.$pnScenePlot.height() - 30) {
				m_renderer.plotContainerScroller.scrollBy(0, -10);
				shouldRefresh = true;
			}

			if (shouldRefresh)
				m_renderer.refresh();
		}
	}

	var onTileTouchedEnd = function (hitData) {
		lastTouchRow = null;
		lastTouchColumn = null;
	}

	var onPlayersChanged = function () {
		rebuildPlayersList();
		onBtnPan(null);
	}

	var onPlayerRemoved = function (player) {
		var entities = self._eworld.getEntities();

		for(var i = 0; i < entities.length; ++i) {
			var entity = entities[i];

			if (entity.CTileOwner && entity.CTileOwner.owner == player) {
				entity.CTileOwner.owner = null;
				self._eworld.trigger(GameplayEvents.Structures.OWNER_CHANGED, entity);
			}

			if (entity.CPlayerData && entity.CPlayerData.player == player) {
				entity.destroy();
				--i;
			}
		}

		onPlayersChanged();
	}
}

ECS.EntityManager.registerSystem('EditorController', EditorController);
SystemsUtils.supplySubscriber(EditorController);