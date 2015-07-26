//===============================================
// TickerStats
// Prints out ticker stats.
//===============================================
"use strict";

var TickerStats = function (m_ticker, m_$text, m_refreshDelay) {
	
	// Stats
	var stats;
	this.refreshStats = function () {
		
		var restart = false;

		var now = Date.now();

		if (stats) {
			stats.paintsCount++;
			stats.fpsSum += m_ticker.fps;
			stats.ticksElapsedSum += m_ticker.lastTicksElapsed;
			stats.diffSum += m_ticker.diff;


			if (now - stats.startTime > m_refreshDelay) {
				var str = '';

				if (!m_ticker.useAnimationFrame)
					str += 'Not using animation frame! <br />';

				str += 'lastTicksElapsed: ' + Math.round(stats.ticksElapsedSum / stats.paintsCount) + '<br />';
				str += 'Diff: ' + Math.round(stats.diffSum / stats.paintsCount) + '<br />';
				str += 'FPS: ' + Math.round(stats.fpsSum / stats.paintsCount) + '<br />';

				m_$text.html(str);
				restart = true;
			}

		} else {
			restart = true;
			m_$text.html('N/a');
		}

		// Restart stats
		if (restart)	{

			if (!stats)
				stats = {};

			
			stats.paintsCount = 0;
			stats.fpsSum = 0;
			stats.ticksElapsedSum = 0;
			stats.diffSum = 0;
			stats.startTime = now;
		}

	}
};