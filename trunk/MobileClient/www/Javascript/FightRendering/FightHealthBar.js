//===============================================
// FightHealthBar
// Creates health bar.
//===============================================
"use strict";

var FightHealthBar = function (element, m_direction, m_showValue) {

	m_direction = (m_direction == undefined) ? FightRenderer.DirectionType.Right : m_direction;
	
	var m_$dom = $(element);

	var m_$container = $('<div>').addClass('fight_health_bar_container').appendTo(m_$dom);

	var m_$background = $('<div>').addClass('fight_health_bar_background').appendTo(m_$container);
	var m_$foreground = $('<div>').addClass('fight_health_bar_foreground').appendTo(m_$background);

	var m_$value = $('<div>').addClass('fight_health_bar_value').text(10).appendTo(m_$container);

	if (m_direction == FightRenderer.DirectionType.Left) {
		RenderUtils.transformSet(m_$background, 'scale(-1)');
		m_$background.appendTo(m_$container);
		m_$value.css('text-align', 'right');

		m_$container.addClass('fight_health_bar_left_direction_offset');
	} else {
		m_$value.css('text-align', 'left');

		m_$container.addClass('fight_health_bar_right_direction_offset');
	}

	this.setBar = function (fillRatio) {

		fillRatio = MathUtils.clamp(fillRatio, 0, 1);

		m_$foreground.css('width', fillRatio * 100 + '%');
	}

	this.setValue = function (value) {
		m_$value.text(value);
	}

	this.destroy = function () {
		m_$container.remove();
	}
}