//===============================================
// Animator
// Extracts animation data and proceeds with animating it.
//===============================================
"use strict";

var Animator = function (animData, sprite, scene) {
	var self = this;
	
	this.resourcePath = animData.resourcePath;
	this.isPaused = false;	// Check out isPlaying() too.
	this.finished = false;
	this.sequenceName = '';
	this.sequenceData = null;
	this.sequences = [];
	this.sprite = sprite;					// Read-only
	this.params = animData.params || {};	// Read-only
	
	this.playSequence = function (name) {
		if (m_currentCycle) {
			m_currentCycle.reset(false);
		}
		
		m_currentCycle = m_cycles[name];
		m_currentCycle.reset(false);
		
		m_currentCycle.__ticksElapsed = 0;
		m_currentCycle.__timeElapsed = 0;
		
		self.isPaused = false;
		self.finished = false;
		self.sequenceName = name;
		self.sequenceData = m_sequencesData[self.sequenceName];

		applySequenceData(self.sequenceData);

		refreshChangedCycles();
	}
	
	this.pauseSequence = function (name, frame) {
		if (frame === undefined) frame = 0;
		
		if (m_currentCycle) {
			m_currentCycle.reset(false);
		}
		
		m_currentCycle = m_cycles[name];
		m_currentCycle.go(frame);
		
		self.isPaused = true;
		self.finished = false;
		self.sequenceName = name;
		self.sequenceData = m_sequencesData[self.sequenceName];

		applySequenceData(self.sequenceData);
	}

	this.play = function () {
		if (!self.finished) {
			self.isPaused = false;
		} else {
			self.playSequence(self.sequenceName);
		}
	}

	this.pause = function () {
		self.isPaused = true;
	}
	
	this.hasSequence = function (name) {
		return self.sequences.indexOf(name) != -1;
	}

	this.isPlaying = function () {
		return !self.isPaused && !self.finished;
	}
	
	this.next = function (ticks) {
		m_currentCycle.next(ticks, true);
		
		m_currentCycle.__ticksElapsed += ticks;
		m_currentCycle.__timeElapsed = m_currentCycle.__ticksElapsed * scene.ticker.tickDuration;

		if (m_currentCycle.repeat) {
			
			if (m_currentCycle.__repeatDuration && m_currentCycle.__timeElapsed >= m_currentCycle.__repeatDuration) {
				self.finished = true;
			}
			
		} else {
			self.finished = m_currentCycle.done && m_currentCycle.__wrapMode != Animator.WrapMode.ClampForever;

			if (m_currentCycle.done) {
				if (m_currentCycle.__wrapMode == Animator.WrapMode.Once) {
					self.isPaused = true;
					m_currentCycle.go(0);
				}

				if (m_currentCycle.__wrapMode == Animator.WrapMode.OnceEnd) {
					self.isPaused = true;
					m_currentCycle.go(m_currentCycle.triplets.length - 1);
				}

				if (m_currentCycle.__wrapMode == Animator.WrapMode.ClampForever) {
					m_currentCycle.go(m_currentCycle.triplets.length - 1);
				}
			}
		}

		refreshChangedCycles();
	}
	
	this.destroy = function () {
		for(var name in m_cycles) {
			m_cycles[name].removeSprite(sprite);
		}
		
		m_cycles = null;
		m_currentCycle = null;
	}
	
	this.getCurrentCycle = function () {
		return m_currentCycle;
	}

	this.getCurrentElapsedTime = function () {
		return m_currentCycle.__timeElapsed;
	}

	this.getCurrentNormalizedTime = function () {
		if (m_currentCycle.repeat)
			var totalTime = self.sequenceData.duration || Number.POSITIVE_INFINITY;
		else
			var totalTime = m_currentCycle.cycleDuration * scene.ticker.tickDuration;
		return m_currentCycle.__timeElapsed / (totalTime);
	}

	this.getCurrentFrame = function () {
		return m_currentCycle.currentTripletIndex;
	}

	//
	// Private
	//
	
	var m_frameWidth = animData.frameWidth;
	var m_frameHeight = animData.frameHeight;
	var m_anchorX = animData.anchorX || 0;
	var m_anchorY = animData.anchorY || 0;
	var m_framesPerRow = animData.framesPerRow || 0;	// If no count, infinite.
	var m_speed = animData.speed;
	var m_cycles = {};
	var m_currentCycle = null;

	var m_sequencesData = {};

	var lastChangedSequenceCount = 0;	// Debugging

	var applySequenceData = function (sequenceData) {

		var frameWidth = (sequenceData.frameWidth == undefined) ? m_frameWidth : sequenceData.frameWidth;
		var frameHeight = (sequenceData.frameHeight == undefined) ? m_frameHeight : sequenceData.frameHeight;

		var anchorX = (sequenceData.anchorX == undefined) ? m_anchorX: sequenceData.anchorX;
		var anchorY = (sequenceData.anchorY == undefined) ? m_anchorY: sequenceData.anchorY;

		if (anchorX == Animator.AnchorX.Left) anchorX = 0;
		if (anchorX == Animator.AnchorX.Center) anchorX = frameWidth / 2;
		if (anchorX == Animator.AnchorX.Right) anchorX = frameWidth;

		if (anchorY == Animator.AnchorY.Top) anchorY = 0;
		if (anchorY == Animator.AnchorY.Center) anchorY = frameHeight / 2;
		if (anchorY == Animator.AnchorY.Bottom) anchorY = frameHeight;


		sprite.anchorX = anchorX;
		sprite.anchorY = anchorY;
		sprite.size(frameWidth, frameHeight);
		sprite.update();
	}

	// Check if someone has changed some cycles runtime (used for development only).
	var refreshChangedCycles = function () {

		if (!Animator._changedSequences)
			return;

		while(lastChangedSequenceCount < Animator._changedSequences.length) {

			var sequence = Animator._changedSequences[lastChangedSequenceCount];

			if (animData.sequences.contains(sequence)) {
				var oldCycle = m_cycles[sequence.name];
				oldCycle.removeSprite(sprite);

				var triplets = generateTriplets(sequence);

				var cycle = generateCycle(sequence, triplets);
				cycle.addSprite(sprite);
				m_cycles[sequence.name] = cycle;

				if (m_currentCycle == oldCycle) {
					m_currentCycle = cycle;
				}
			}

			lastChangedSequenceCount++;
		}

	}
	

	var validate = function () {
		for(var name in m_cycles) {
			var cycle = m_cycles[name];

			for(var i = 0; i < cycle.triplets.length; ++i) {
				var triplet = cycle.triplets[i];
				if (self.sprite.imgNaturalWidth < triplet[0] + m_frameWidth || self.sprite.imgNaturalHeight < triplet[1] + m_frameHeight)
					console.warn('The animator of ' + self.resourcePath + ' has a sequence ' + name + ' that is bigger than the sprite!');
			}

			// This is no longer true.
			//if (self.sprite.imgNaturalWidth % m_frameWidth != 0 || self.sprite.imgNaturalHeight % m_frameHeight != 0)
			//	console.warn('The animator of ' + self.resourcePath + ' detected that the sprite size is not multiple of the frame width/height.');
		}
	}
	
	var initialize = function () {

		for(var i = 0; i < animData.sequences.length; ++i) {
			var sequence = animData.sequences[i];
			
			var triplets = generateTriplets(sequence);

			var cycle = generateCycle(sequence, triplets);
			cycle.addSprite(sprite);
			m_cycles[sequence.name] = cycle;

			// Validate events
			if (sequence.events) {
				for(var j = 0; j < sequence.events.length; ++j) {
					var animEvent = sequence.events[j];

					if (animEvent.frame === undefined && animEvent.elapsed == undefined && animEvent.timeNormalized == undefined) {
						console.warn('Event data does\'t specify when to trigger for: ' + self.resourcePath + ' on ' + sequence.name + ' - ' + animEvent.event);
						continue;
					}



					if (animEvent.frame !== undefined) {
						var totalFrames = cycle.triplets.length;
						if (animEvent.frame < 0 || animEvent.frame >= totalFrames) {
							console.warn('Event data scheduled for ' + animEvent.frame + ' frame, but only [0, ' + (totalFrames - 1) + '] allowed for: ' + self.resourcePath + ' on ' + sequence.name + ' - ' + animEvent.event);
						}
						continue;
					}

					if (animEvent.elapsed !== undefined) {
						if (cycle.repeat)
							var totalDutation = sequence.duration || Number.POSITIVE_INFINITY;
						else
							var totalDutation = cycle.cycleDuration * scene.ticker.tickDuration;

						if (animEvent.elapsed < 0 || animEvent.elapsed > totalDutation) {
							console.warn('Event data scheduled for ' + animEvent.elapsed + ' time, but only [0, ' + totalDutation + '] allowed for: ' + self.resourcePath + ' on ' + sequence.name + ' - ' + animEvent.event);
						}
						continue;
					}

					if (animEvent.timeNormalized !== undefined) {
						if (cycle.repeat && sequence.duration === undefined)
							console.warn('Event data scheduled for ' + animEvent.timeNormalized + ' normalized time, but animation is endless: ' + self.resourcePath + ' on ' + sequence.name + ' - ' + animEvent.event);

						if (animEvent.timeNormalized < 0 || animEvent.timeNormalized > 1) {
							console.warn('Event data scheduled for ' + animEvent.timeNormalized + ' normalized time, but only [0, 1] allowed for: ' + self.resourcePath + ' on ' + sequence.name + ' - ' + animEvent.event);
						}
						continue;
					}
				}
			}

			
			// Expose available sequence names.
			self.sequences.push(sequence.name);
			m_sequencesData[sequence.name] = sequence;
		}

		sprite.size(m_frameWidth, m_frameHeight);
		sprite.anchorX = m_anchorX;
		sprite.anchorY = m_anchorY;

		// Sanity-checks
		if (sprite.imgNaturalWidth) {
			validate();
		} else {
			sprite.addOnLoadHandler(validate);
		}
	}

	var generateTriplets = function (sequence) {
		var fx, fy;

		var speed = (sequence.speed == undefined) ? m_speed : sequence.speed;
		var startX = (sequence.startX == undefined) ? 0 : sequence.startX;
		var startY = (sequence.startY == undefined) ? 0 : sequence.startY;
		var frameWidth = (sequence.frameWidth == undefined) ? m_frameWidth : sequence.frameWidth;
		var frameHeight = (sequence.frameHeight == undefined) ? m_frameHeight : sequence.frameHeight;
		var framesPerRow = (sequence.framesPerRow == undefined) ? m_framesPerRow : sequence.framesPerRow;

		var triplets = [];
		var startIndex = sequence.startIndex || 0;
		var endIndex = startIndex + sequence.frames;
		for(var index = startIndex; index < endIndex ; ++index) {
			
			if (sequence.frameSamples && index < sequence.frameSamples.length) {
				var sampleIndex = sequence.frameSamples[index];
				if (sampleIndex === null || sampleIndex < 0) {
					sampleIndex = index;
				}
			} else {
				var sampleIndex = index;
			}
			

			if (framesPerRow > 0) {
				fx = startX + (sampleIndex % framesPerRow) * frameWidth;
				fy = startY + parseInt(sampleIndex / framesPerRow) * frameHeight;
			} else {
				fx = startX + sampleIndex * frameWidth;
				fy = startY;
			}

			var frameSpeed = (Utils.isFunction(speed)) ? speed(index - startIndex) : speed;

			if (sequence.frameSpeeds && index - startIndex < sequence.frameSpeeds.length) {
				frameSpeed = sequence.frameSpeeds[index - startIndex] || frameSpeed;
			}

			triplets.push([ fx, fy, frameSpeed ]);
		}

		return triplets;
	}

	var generateCycle = function (sequence, triplets) {

		// Duration of animation.
		sequence.wrapMode = sequence.wrapMode || Animator.WrapMode.Once;

		// Add reverse triplets if needed
		if (sequence.wrapMode == Animator.WrapMode.OnceReverse || sequence.wrapMode == Animator.WrapMode.PingPong) {
			for(var t = triplets.length - 1; t >= 0; --t) {
				triplets.push(triplets[t].slice(0));
			}
			triplets.push(triplets[0]);
		}


		var cycle = scene.Cycle(triplets);

		switch (sequence.wrapMode) {
			case Animator.WrapMode.Once:
			case Animator.WrapMode.OnceEnd:
			case Animator.WrapMode.OnceReverse:
			case Animator.WrapMode.ClampForever:
				cycle.repeat = false;
			break;

			case Animator.WrapMode.Loop:
			case Animator.WrapMode.PingPong:
				cycle.repeat = true;
				cycle.__repeatDuration = sequence.duration;
			break;

			default:
				console.error("Wrap mode " + sequence.wrapMode + " is not supported yet!");
		}

		cycle.__wrapMode = sequence.wrapMode;
		return cycle;
	}
	
	initialize();
}


Animator.WrapMode = {
	Once: 0,			// Run once and position at first frame when finished.
	OnceReverse: 0,		// Run once forward + backward and position at first frame when finished.
	OnceEnd: 0,			// Run once and position at last frame when finished.
	Loop: 0,			// Loop forever, until stopped.
	PingPong: 0,		// Play forward + backward animation forever.
	ClampForever: 0,	// Run once and keep playing last frame forever.
};
Enums.enumerate(Animator.WrapMode);

Animator.AnchorX = {
	Left: 'Left',
	Center: 'Center',
	Right: 'Right',
};

Animator.AnchorY = {
	Top: 'Top',
	Center: 'Center',
	Bottom: 'Bottom',
};
