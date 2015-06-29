//===============================================
// DevTools
// Developer tools.
//===============================================
"use strict";

var DevTools = new function () {
	
	var AnimationInfoTool = new function () {

		//
		// Animation Speed Tool
		//
		var m_$animationTool = $('#AnimationInfoTool');
		var m_$animationToolList = $('#AnimationsList');
		var m_$animationToolSpeedInput = $('#TbAnimationInfo');
		var m_$animationToolFrames = $('#LbAnimationInfoFrames');
		var m_$animationToolSize = $('#LbAnimationInfoSize');
		var m_$animationToolEvents = $('#LbAnimationInfoEvents');

		var namespace = [];
		var sequenceBinds = {};
		var populateAnimations = function (collection) {

			for (var name in collection) {
				var animation = collection[name];

				// Check if it is an animation or a collection of animations (namespace).
				if (animation.resourcePath) {
				
					var path = '';
					for(var i = 0; i < namespace.length; ++i) {
						path += namespace[i] + '.';
					}

					path += name;

					$('<option />').attr('disabled','disabled').text(path).appendTo(m_$animationToolList);

					for(var i = 0; i < animation.sequences.length; ++i) {
						var sequenceName = animation.sequences[i].name;
						var sequencePath = path + '.' + sequenceName;

						$('<option />').attr("value", sequencePath).text('>' + sequenceName).appendTo(m_$animationToolList);

						sequenceBinds[sequencePath] = {
							animation: animation, 
							sequence: animation.sequences[i]
						};
					}


				} else {
					namespace.push(name);
					populateAnimations(animation);
					namespace.pop();
				}
			}
		}


		var onAnimationListChanged = function () {
			var sequencePath = m_$animationToolList.val();

			var bind = sequenceBinds[sequencePath];

			var speed = bind.sequence.speed || bind.animation.speed;
			var frames = bind.sequence.frames;
			var width = bind.sequence.frameWidth || bind.animation.frameWidth;
			var height = bind.sequence.frameHeight || bind.animation.frameHeight;
			var events = (bind.sequence.events) ? bind.sequence.events.length : 0;

			m_$animationToolSpeedInput.val(speed);
			m_$animationToolFrames.text(frames);
			m_$animationToolSize.text(width + 'x' + height);
			m_$animationToolEvents.text(events);
		}

		var onApply = function () {
			var sequencePath = m_$animationToolList.val();

			var bind = sequenceBinds[sequencePath];

			var speed = parseInt(m_$animationToolSpeedInput.val());

			if (isNaN(speed))
				return;

			bind.sequence.speed = speed;

			Animator._changedSequences.push(bind.sequence);
		}

		var onInputKey = function (event) {
			// Enter key
			if (event.which == 13) {
				event.preventDefault();
				onApply();
			}
		}



		m_$animationToolList.change( onAnimationListChanged );
		m_$animationToolSpeedInput.keydown(onInputKey);
		$('#BtnAnimationInfoApply').click(onApply);

		Animator._changedSequences = [];
		populateAnimations(SpriteAnimations);
		onAnimationListChanged();
	}
	
};