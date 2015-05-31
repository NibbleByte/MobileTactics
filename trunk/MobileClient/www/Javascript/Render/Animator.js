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
	this.sequenceData = null;
	this.sequences = [];
	this.sprite = sprite;	// Read-only
	
	this.playSequence = function (name) {
		if (m_currentCycle) {
			m_currentCycle.reset(false);
		}
		
		m_currentCycle = m_cycles[name];
		m_currentCycle.reset(true);
		
		m_currentCycle.__ticksElapsed = 0;
		m_currentCycle.__timeElapsed = 0;
		
		self.isPaused = false;
		self.finished = false;
		self.sequenceName = name;
		self.sequenceData = animData.sequences.find(function (sequence) { return sequence.name == self.sequenceName; });
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
		self.sequenceData = animData.sequences.find(function (sequence) { return sequence.name == self.sequenceName; });
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

				// Note: Last triplet is not valid.
				if (m_currentCycle.__wrapMode == Animator.WrapMode.OnceEnd) {
					self.isPaused = true;
					m_currentCycle.go(m_currentCycle.triplets.length - 2);
				}

				if (m_currentCycle.__wrapMode == Animator.WrapMode.ClampForever) {
					m_currentCycle.go(m_currentCycle.triplets.length - 2);
				}
			}
		}
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
			
			var speed = (sequence.speed == undefined) ? m_defaultSpeed : sequence.speed;

			var triplets = [];
			for(var index = sequence.startIndex; index <= sequence.startIndex +sequence.frames; ++index) {
				
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

			var cycle = generateCycle(sequence, triplets);
			cycle.addSprite(sprite);
			m_cycles[sequence.name] = cycle;
			
			sprite.size(m_frameWidth, m_frameHeight);
			sprite.anchorX = m_anchorX;
			sprite.anchorY = m_anchorY;
			sprite.position(sprite.x, sprite.y);	// NOTE: This will CHANGE x & y with the anchor values.
			sprite.update();
			

			// Validate events
			if (sequence.events) {
				for(var j = 0; j < sequence.events.length; ++j) {
					var animEvent = sequence.events[j];

					if (animEvent.frame === undefined && animEvent.elapsed == undefined && animEvent.timeNormalized == undefined) {
						console.warn('Event data does\'t specify when to trigger for: ' + self.resourcePath + ' on ' + sequence.name + ' - ' + animEvent.event);
						continue;
					}



					if (animEvent.frame !== undefined) {
						var totalFrames = cycle.triplets.length - 1;
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
		}

		// Sanity-checks
		if (self.sprite.imgNaturalWidth) {
			validate();
		} else {
			self.sprite.addOnLoadHandler(validate);
		}
	}

	var generateCycle = function (sequence, triplets) {

		// Duration of animation.
		sequence.wrapMode = sequence.wrapMode || Animator.WrapMode.Once;

		// Add reverse triplets if needed
		if (sequence.wrapMode == Animator.WrapMode.OnceReverse || sequence.wrapMode == Animator.WrapMode.PingPong) {
			// Note: Last triplet is not valid.
			triplets.splice(triplets.length - 1, 1);

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

Animator.spriteOriginal = {
	setX: sjs.Sprite.prototype.setX,
	setY: sjs.Sprite.prototype.setY,
}

// NOTE: This actually changes the X & Y of the sprite! It doesn't just offset the rendering.
sjs.Sprite.prototype.setX = function setX(value) {
	var anchorX = (this.anchorX || 0) * Math.abs(this.xscale);

	// If scale is smaller, image is flipped, so anchor should be relative to the width.
	if (this.xscale < 0)
		anchorX = this.w - anchorX;

	Animator.spriteOriginal.setX.call(this, value - anchorX);
}

sjs.Sprite.prototype.setY = function setY(value) {
	var anchorY = (this.anchorY || 0) * Math.abs(this.xscale);

	// If scale is smaller, image is flipped, so anchor should be relative to the height.
	if (this.yscale < 0)
		anchorY = this.h - anchorY;

	Animator.spriteOriginal.setY.call(this, value - anchorY);
}


Animator.WrapMode = {
	Once: 0,			// Run once and position at first frame when finished.
	OnceReverse: 0,		// Run once forward + backward and position at first frame when finished.
	OnceEnd: 0,			// Run once and position at last frame when finished.
	Loop: 0,			// Loop forever, until stopped.
	PingPong: 0,		// Play forward + backward animation forever.
	ClampForever: 0,	// Run once and keep playing last frame forever.
}
Enums.enumerate(Animator.WrapMode);