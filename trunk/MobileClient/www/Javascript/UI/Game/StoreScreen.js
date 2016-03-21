//===============================================
// StoreScreen
// Takes care of the store rendering.
//===============================================
"use strict";

var StoreScreen = new function () {
	var self = this;

	this.Events = {
		STORE_SHOWN:	"store_screen.store_shown",
		STORE_HIDE:		"store_screen.store_hide",
	}
	
	var m_$container = $('#Store');
	var m_$table = $('#StoreList > tbody');
	var m_$btnBuy = $('#BtnStoreBuy');
	var m_items = null;

	var subscriber = new DOMSubscriber();

	this.apply = function (eworld, tile) {
		m_items = Store.getPriceListFromTile(eworld, tile);

		if (m_items && m_items.length > 0) {
			m_$container.show();

			$(self).trigger(self.Events.STORE_SHOWN)

			m_$table.empty();

			// Headers
			var $tr = $('<tr>').appendTo(m_$table);

			$('<th>').appendTo($tr).text('Unit');
			$('<th>').appendTo($tr).text('Price');


			for(var i = 0; i < m_items.length; ++i) {
				var item = m_items[i];
				
				var $tr = $('<tr>').appendTo(m_$table);

				var $btnBuy = $('<button>')
				.attr('itemIndex', i)
				.attr('disabled', !Store.canBuyItem(m_items[i]))
				.click(buyItem)
				.text('Buy');

				$('<td>').appendTo($tr).text(item.name);
				$('<td>').appendTo($tr).text(item.price);
				$('<td>').appendTo($tr).append($btnBuy);
			}

		} else {
			self.hide();
		}
	};

	this.hide = function () {
		m_$container.hide();
		$(self).trigger(self.Events.STORE_HIDE)
	}

	var buyItem = function (event) {
		var item = m_items[$(event.target).attr('itemIndex')];

		if (Utils.assert(item)) {
			self.hide();
			return;
		}

		// Yes, this can happen, if the browser doesn't support "disabled" property (yes, IE7).
		if (Utils.assert(Store.canBuyItem(item), 'Could not buy item: ' + item.name)) {
			return;
		}
		
		Store.buyItem(item);

		self.hide();
	}

	// Initialize
	this.hide();
	subscriber.subscribe($('#BtnStoreClose'), 'click', this.hide);
};
