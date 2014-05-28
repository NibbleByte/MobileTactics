//===============================================
// Animator
// Extracts animation data and proceeds with animating it.
//===============================================
"use strict";

var Animator = function (animData, sprite, scene) {
	var self = this;
	
	this.resourcePath = animData.resourcePath;
	this.isPaused = false;
	this.finished = false;
	this.sequenceName = '';
	this.sequences = [];
	this.sprite = sprite;	// Read-only
	
	this.playSequence = function (name) {
		if (m_currentCycle) {
			m_currentCycle.reset(false);
		}
		
		m_currentCycle = m_cycles[name];
		m_currentCycle.reset(true);
		
		if (m_currentCycle.repeat) {
			m_currentCycle.__repeatTicksElapsed = 0;
		}
		
		self.isPaused = false;
		self.finished = false;
		self.sequenceName = name;
	}
	
	this.pauseSequence = function (name, frame) {
		if (frame === undefined) frame = 0;
		
		if (m_currentCycle) {
			m_currentCycle.reset(false);
		}
		
		m_currentCycle = m_cycles[name];
		m_currentCycle.go(frame);
		m_currentCycle.update();
		
		self.isPaused = true;
		self.finished = false;
		self.sequenceName = name;
	}
	
	this.hasSequence = function (name) {
		return self.sequences.indexOf(name) != -1;
	}
	
	this.next = function (ticks) {
		m_currentCycle.next(ticks, true);
		
		if (m_currentCycle.repeat) {
			m_currentCycle.__repeatTicksElapsed += ticks;
			
			if (m_currentCycle.__repeatDuration && m_currentCycle.__repeatTicksElapsed >= m_currentCycle.__repeatDuration) {
				self.finished = true;
			}
			
		} else {
			self.finished = m_currentCycle.done;
		}
	}
	
	this.destroy = function () {
		for(var name in m_cycles) {
			m_cycles[name].removeSprite(sprite);
		}
		
		m_cycles = null;
		m_currentCycle = null;
	}
	
	//
	// Private
	//
	
	var m_frameWidth = animData.frameWidth;
	var m_frameHeight = animData.frameHeight;
	var m_framesPerRow = animData.framesPerRow || 0;	// If no count, infinite.
	var m_defaultSpeed = animData.speed;
	var m_cycles = {};
	var m_currentCycle = null;
	
	var validate = function () {
		for(var name in m_cycles) {
			var cycle = m_cycles[name];

			// NOTE: last triplet is invalid, don't take it into account.
			for(var i = 0; i < cycle.triplets.length - 1; ++i) {
				var triplet = cycle.triplets[i];
				if (self.sprite.imgNaturalWidth < triplet[0] + m_frameWidth || self.sprite.imgNaturalHeight < triplet[1] + m_frameHeight)
					console.warn('The animator of ' + self.resourcePath + ' has a sequence ' + self.sequenceName + ' that is bigger than the sprite!');
			}

			if (self.sprite.imgNaturalWidth % m_frameWidth != 0 || self.sprite.imgNaturalHeight % m_frameHeight != 0)
				console.warn('The animator of ' + self.resourcePath + ' detected that the sprite size is not multiple of the frame width/height.');
		}
	}
	
	var initialize = function () {
		for(var i = 0; i < animData.sequences.length; ++i) {
			var sequence = animData.sequences[i];
			
			var triplets = [];
			for(var index = sequence.startIndex; index <= sequence.startIndex +sequence.frames; ++index) {
				var speed = (sequence.speed == undefined) ? m_defaultSpeed : sequence.speed;
				
				if (m_framesPerRow > 0) {
					triplets.push([
									(index % m_framesPerRow) * m_frameWidth,
									parseInt(index / m_framesPerRow) * m_frameHeight,
									speed
								]);
				} else {
					triplets.push([ index * m_frameWidth, 0, speed ]);
				}
			}
			
			var cycle = scene.Cycle(triplets);
			cycle.addSprite(sprite);
			
			// Duration of animation.
			if (sequence.repeat) {
				cycle.repeat = true;
				cycle.__repeatDuration = sequence.duration;
				
			} else {
				cycle.repeat = false;
			}
			
			m_cycles[sequence.name] = cycle;
			
			sprite.size(m_frameWidth, m_frameHeight);
			
			
			// Expose available sequence names.
			self.sequences.push(sequence.name);
		}

		// Sanity-checks
		if (self.sprite.imgNaturalWidth) {
			validate(m_currentCycle);
		} else {
			self.sprite.addOnLoadHandler(validate);
		}
	}
	
	initialize();
}
