//===============================================
// EditorController
// User control in the editor.
//===============================================
"use strict";

var EditorGamePropertiesController = function (m_editorController, m_renderer) {
	var self = this;
	
	var m_$GameProps = $('#GamePropsEditor');
	var m_$GamePropsName = $('#GamePropsNameEditor');
	var m_$GamePropsDescription = $('#GamePropsDescriptionEditor');
	var m_$GamePropsWidth = $('#GamePropsWidthEditor');
	var m_$GamePropsHeight = $('#GamePropsHeightEditor');
	var m_$GamePropsLockSizes = $('#GamePropsLockSizesEditor');

	var m_subscriber = new DOMSubscriber();

	//
	// Entity system initialize
	//
	this.initialize = function () {

		m_subscriber.subscribe($('#BtnGamePropsEditor'), 'click', onGameProps);

		m_subscriber.subscribe($('#BtnGamePropsApply'), 'click', onBtnApply);
		m_subscriber.subscribe($('#BtnGamePropsCancel'), 'click', onBtnCancel);

		self._eworld.blackboard[EditorBlackBoard.Properties.LOCK_SIZES] = false;
	};
	
	this.uninitialize = function () {
		m_subscriber.unsubscribeAll();
	};

	var onGameProps = function (event) {
		m_$GameProps.show();

		m_$GamePropsWidth.val(m_renderer.getRenderedColumns());
		m_$GamePropsHeight.val(m_renderer.getRenderedRows());

		m_$GamePropsLockSizes.prop('checked', self._eworld.blackboard[EditorBlackBoard.Properties.LOCK_SIZES]);
	}

	var onBtnApply = function (event) {
		m_$GameProps.hide();

		m_editorController.setWorldSize(false, parseInt(m_$GamePropsHeight.val()), parseInt(m_$GamePropsWidth.val()));

		self._eworld.blackboard[EditorBlackBoard.Properties.LOCK_SIZES] = m_$GamePropsLockSizes.prop('checked');
	}
	
	var onBtnCancel = function (event) {
		m_$GameProps.hide();
	}
}

ECS.EntityManager.registerSystem('EditorGamePropertiesController', EditorGamePropertiesController);
SystemsUtils.supplySubscriber(EditorGamePropertiesController);