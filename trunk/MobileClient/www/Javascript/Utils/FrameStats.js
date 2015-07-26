//===============================================
// FrameStats
// Prints out frame stats.
//===============================================
"use strict";

var FrameStats = function (m_$text, m_refreshDelay) {
	var self = this;


	this.togglePause = function () {
		if (isPaused)
			self.resume();
		else
			self.pause();
	}

	this.pause = function () {
		isPaused = true;
	}
	this.resume = function () {
		isPaused = false;

		refreshStats();
	}

	this.isPaused = function () {
		return isPaused;
	}
	
	var isPaused = false;

	// Stats
	var stats;
	var totalFramesCount = 0;
	var refreshStats = function () {

		if (isPaused)
			return;
		
		var restart = false;

		var now = Date.now();

		if (stats) {
			var diff = now - stats.lastTime;
			stats.lastTime = now;
			stats.framesCount++;
			stats.elapsed += diff;
			totalFramesCount++;

			if (now - stats.startTime > m_refreshDelay) {
				var str = '';

				str += 'Elapsed AVG: ' + Math.round(stats.elapsed / stats.framesCount) + '<br />';
				//str += 'Frames: ' + stats.framesCount + '<br />';
				str += 'FPS: ' + Math.round(stats.framesCount / ((now - stats.startTime) / 1000) ) + '<br />';
				//str += 'Frames: ' + totalFramesCount;

				m_$text.html(str);
				restart = true;
			}

		} else {
			restart = true;
			m_$text.html('N/a');
		}

		// Restart stats
		if (restart) {
			if (!stats)
				stats = {};

			stats.framesCount = 0;
			stats.elapsed = 0;
			stats.lastTime = now;
			stats.startTime = now;
		}

		if (window.requestAnimationFrame) {
			window.requestAnimationFrame(refreshStats);
		} else {
			setTimeout(refreshStats, 16);
		}
	}

	refreshStats();
};