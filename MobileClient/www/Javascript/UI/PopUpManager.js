//===============================================
// PopUpManager
// 
//===============================================
"use strict";

var PopUpManager = new function (m_element) {
	var self = this;

	var DEFAULT_PARAMS = {
		title: 'Message',
		message: '',
		buttons: ['Ok'],
		buttonsHandlers: null,
		userData: null,
	}

	var m_$container = $('#PopUpDialog');
	var m_$lbTitle = $('#PopUpDialogTitle').empty();
	var m_$lbMessage = $('#PopUpDialogMessage').empty();
	var m_$buttonsContainer = $('#PopUpDialogButtons').empty();

	var m_requestsQueue = [];

	var display = function (popUpData) {

		m_$lbTitle.text(popUpData.title);
		m_$lbMessage.html(popUpData.message);

		m_$buttonsContainer.empty();

		for(var i = 0; i < popUpData.buttons.length; ++i) {
			var hotkeyClass = '';
			if (i == 0) hotkeyClass = 'btn_apply';
			if (i == popUpData.buttons.length - 1) hotkeyClass = 'btn_cancel';
			if (i == 0 && popUpData.buttons.length == 1) hotkeyClass = 'btn_done';

			$('<button>')
			.text(popUpData.buttons[i])
			.attr('ChoiceIndex', i)
			.click(choiceHandler)
			.addClass(hotkeyClass)
			.appendTo(m_$buttonsContainer);
		}
	}

	var choiceHandler = function (event) {

		var choiceIndex = parseInt($(event.currentTarget).attr('ChoiceIndex'));

		var popUpData = m_requestsQueue.shift();

		if (m_requestsQueue.length == 0) {
			m_$container.hide();
		} else {
			display(m_requestsQueue[0]);
		}


		if (!popUpData.buttonsHandlers)
			return;

		var userHandler = popUpData.buttonsHandlers[choiceIndex];

		if (userHandler) userHandler(popUpData.userData);
	}

	this.show = function (popUpData) {

		popUpData = $.extend({}, DEFAULT_PARAMS, popUpData);

		m_requestsQueue.push(popUpData);
		
		if (m_requestsQueue.length == 1) {
			display(m_requestsQueue[0]);
		}

		m_$container.show();
	}


	//
	// Short-cuts
	//
	this.message = function (message, handler, userData) {
		self.show({
		  title: 'Message',
		  message: message,
		  buttons: ['Ok'],
		  buttonsHandlers: [ handler ],
		  userData: userData,
		});
	}
	
	this.messageYesNo = function (message, handler, userData) {
		self.show({
		  title: 'Question',
		  message: message,
		  buttons: ['Yes', 'No'],
		  buttonsHandlers: [ handler ],
		  userData: userData,
		});
	}
	
	this.warning = function (message, handler, userData) {
		self.show({
		  title: 'Warning',
		  message: message,
		  buttons: ['Ok'],
		  buttonsHandlers: [ handler ],
		  userData: userData,
		});
	}

	this.warningYesNo = function (message, handler, userData) {
		self.show({
		  title: 'Warning',
		  message: message,
		  buttons: ['Yes', 'No'],
		  buttonsHandlers: [ handler ],
		  userData: userData,
		});
	}

	this.confirmYesNo = function (message, handler, userData) {
		self.show({
		  title: 'Confirm',
		  message: message,
		  buttons: ['Yes', 'No'],
		  buttonsHandlers: [ handler ],
		  userData: userData,
		});
	}
};
