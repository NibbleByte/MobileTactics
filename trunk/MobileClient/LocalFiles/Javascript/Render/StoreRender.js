//===============================================
// StoreRender
// Takes care of the store rendering.
//===============================================
"use strict";

var StoreRender = new function () {
	var self = this;
	
	var m_$container = $('#Store');
	var m_$list = $('#SelStoreList');
	var m_items = null;

	var subscriber = new DOMSubscriber();

	this.apply = function (eworld, tile) {
		m_items = Store.getPriceListFromTile(eworld, tile);

		if (m_items && m_items.length > 0) {
			m_$container.show();

			m_$list.empty();

			for(var i = 0; i < m_items.length; ++i) {
				$('<option></option>')
				.attr("value", i)
				.attr('disabled', !Store.canBuyItem(m_items[i]))
				.text(m_items[i].name)
				.appendTo(m_$list);
			}

		} else {
			self.hide();
		}
	};

	this.hide = function () {
		m_$container.hide();
	}

	var buyItem = function (event) {
		var item = m_items[m_$list.val()];

		if (Utils.assert(item)) {
			self.hide();
			return;
		}

		// Yes, this can happen, if the browser doesn't support "disabled" property (yes, IE7).
		if (Store.canBuyItem(item)) {
			Utils.assert(Store.buyItem(item), 'Could not buy item: ' + item.name);
		}

		self.hide();
	}

	// Initialize
	this.hide();
	subscriber.subscribe($('#BtnStoreClose'), 'click', this.hide);
	subscriber.subscribe($('#BtnStoreBuy'), 'click', buyItem);
};
