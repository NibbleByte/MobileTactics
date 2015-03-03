//===============================================
// FrameStats
// Prints out frame stats.
//===============================================
"use strict";

var FrameStats = function (m_$text, m_refreshDelay) {
	var self = this;
	
	// Stats
	var stats;
	var refreshStats = function () {
		
		var restart = false;

		if (stats) {
			var now = new Date().getTime();
			var diff = now - stats.lastTime;
			stats.lastTime = now;
			stats.framesCount++;
			stats.elapsed += diff;

			if (now - stats.startTime > m_refreshDelay) {
				var str = '';

				str += 'Elapsed AVG: ' + Math.round(stats.elapsed / stats.framesCount) + '<br />';
				//str += 'Frames: ' + stats.framesCount + '<br />';
				str += 'FPS: ' + Math.round(stats.framesCount / ((now - stats.startTime) / 1000) ) + '<br />';

				m_$text.html(str);
				restart = true;
			}

		} else {
			restart = true;
			m_$text.html('N/a');
		}

		// Restart stats
		if (restart)	{
			stats = {
				framesCount: 0,
				elapsed: 0,
				lastTime: new Date().getTime(),
				startTime: new Date().getTime(),
			};
		}

		if (window.requestAnimationFrame) {
			window.requestAnimationFrame(refreshStats);
		} else {
			setTimeout(refreshStats, 16);
		}
	}

	refreshStats();
};