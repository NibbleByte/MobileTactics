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

	//
	// Entity system initialize
	//
	this.initialize = function () {

		self._eworldSB.subscribe(ClientEvents.Input.TILE_CLICKED, onTileClicked);

		rebuildTerrainBrushList();
		onBtnPan();

		// Toolbar listeners
		m_subscriber.subscribe($('#BtnPanEditor'), 'click', onBtnPan);
		m_subscriber.subscribe($('#BtnTerrainEditor'), 'click', onBtnTerrain);
		m_subscriber.subscribe($('#BtnPlaceablesEditor'), 'click', onBtnPlaceables);

		m_subscriber.subscribe(m_$TerrainBrushList, 'change', onTerrainBrushListChange);
	};
	
	this.uninitialize = function () {
		m_subscriber.unsubscribeAll();
	};

	var rebuildTerrainBrushList = function () {
		m_$TerrainBrushList.empty();

		for (var name in GameWorldTerrainType) {
			$('<option />').attr("value", GameWorldTerrainType[name]).text(name).appendTo(m_$TerrainBrushList);
		}
	}

	var changeBrush = function (brush) {
		if (m_currentBrush && m_currentBrush.destroy) {
			m_currentBrush.destroy();
		}

		m_currentBrush = brush;

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
		m_$PlayerBrushList.hide();
		m_$PlaceablesBrushList.hide();

		changeBrush(new TerrainBrush(self._eworld, m_world, parseInt(m_$TerrainBrushList.val())));

		m_renderer.plotContainerScroller.disable();
	}

	var onBtnPlaceables = function (event) {
		m_$TerrainBrushList.hide();
		m_$PlayerBrushList.show();
		m_$PlaceablesBrushList.show();

		m_renderer.plotContainerScroller.disable();
	}

	var onTerrainBrushListChange = function () {
		if (Utils.assert(m_currentBrush instanceof TerrainBrush))
			return;

		m_currentBrush.terrainType = parseInt(m_$TerrainBrushList.val());

		self._eworld.trigger(EditorEvents.Brushes.ACTIVE_BRUSH_MODIFIED, m_currentBrush);
	}

	var onTileClicked = function (event, tile) {

		if (m_currentBrush)
			m_currentBrush.place(tile.CTile.row, tile.CTile.column);
	}
}

ECS.EntityManager.registerSystem('EditorController', EditorController);
SystemsUtils.supplySubscriber(EditorController);