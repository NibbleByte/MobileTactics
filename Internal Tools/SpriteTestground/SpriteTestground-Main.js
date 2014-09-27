// BattleTestground Main entry point
"use strict";

$(function () {

	var onSpriteFolderSelected = function (event) {
		storeValue('SpriteFolderPath');

		onSpriteAnimationDataSaved(event);
	}
				
	var onColorChanged = function (event) {
		storeValue('Color');

		var hue = parseInt($color.val()) || 0;
		var rgb = {};
		Colors.hsv2rgbFast(hue, 1, 1, rgb);
		var hex = Colors.rgb2hex(rgb);

		$lbColor
		.text(hue)
		.css('color', hex);

		if (sprite.imgLoaded)
			SpriteColorizeManager.colorizeSprite(sprite, hue);
	}

	var onColorBGChanged = function (event) {
		storeValue('ColorBG');

		$(document.body).css('background', '#' + $lastStored.val());
		$scene.css('background', '#' + $lastStored.val());
	}

	var onBackgroundSelected = function (event) {
		storeValue('BackgroundImagePath');
		storeValue('BackgroundImagePath');

		if ($lastStored.val()) {
			$scene.css('background', 'url("' + $lastStored.val().replace(/\\/g, '/') + '")');
			onBackgroundOffsetChanged(null);
		} else {
			onColorBGChanged(event);
		}
	}

	var onBackgroundCleared = function (event) {
		$('#BackgroundImagePath').val('');
		onBackgroundSelected(event);
	}
	var onBackgroundOffsetChanged = function (event) {
		storeValue('BackgroundImageX');
		storeValue('BackgroundImageY');

		var x = $('#BackgroundImageX').val() || 0;
		var y = $('#BackgroundImageY').val() || 0;

		$scene.css('background-position-x', x + 'px');
		$scene.css('background-position-y', y + 'px');
	}

	var onSpriteAnimationDataSaved = function (event) {
		storeValue('SpriteAnimationData');
		$spriteAnimationDataError.text('');

		try {
			animData = eval('(' + $lastStored.val() + ')');
		} catch (err) {
			$spriteAnimationDataError.text(err.message);
			return;
		}

		if (!animData || typeof(animData) !== 'object') {
			$spriteAnimationDataError.text('No animation data provided.');
			return;
		}

		if (!animData.resourcePath) {
			$spriteAnimationDataError.text('Animation must contain resourcePath property.');
			return;
		}

		if (animator) {
			animator.destroy();
		}	
											
		var $select = $('#SpriteAnimationDataList');
		$select.empty();
		if (animData.sequences) {
			for(var i = 0; i < animData.sequences.length; ++i) {
				var sequence = animData.sequences[i];
				$('<option></option>').attr("value", sequence.name).text(sequence.name).appendTo($select);
			}

			animator = new Animator(animData, sprite, scene);

			if ($spriteFolder.val()) {
				sprite.loadImg($spriteFolder.val().replace(/\\/g, '/') + animator.resourcePath, false);
				sprite.update();
			}

			if (animator.hasSequence(selectedSequence)) {
				$select.val(selectedSequence);
			}
							
		} else {
			$spriteAnimationDataError.text('No sequences in animation.');
			animator = null;

			if (animData) {
				sprite.loadImg($spriteFolder.val().replace(/\\/g, '/') + animData.resourcePath, true);
				sprite.update();
			}
		}

		onSpriteAnimationDataListChanged(event, $select.val());
	}

	var onSpriteAnimationDataToggleVisible = function (event) {
		$('#SpriteAnimationData').toggle();
	}

	var onSpriteAnimationDataListChanged = function (event, value) {
		storeValue('SpriteAnimationDataList');

		// First time, select control is still empty.
		selectedSequence = $spriteAnimationDataList.val() || value;
						

		if (animator && selectedSequence == animator.sequenceName)
			return;
						
		if (selectedSequence && animator) {
			if (animator.hasSequence(selectedSequence)) {
				animator.playSequence(selectedSequence);

			} else {
				$spriteAnimationDataError.text('Animation doesn\'t have such sequence?!');
			}
		}

		if (sprite.imgLoaded) {
			sprite.update();
		}
	}


	var onSpritePlay = function (event) {
		if (animator) {
			animator.play();
		}
	}

	var onSpritePause = function (event) {
		if (animator) {
			animator.pause();
		}
	}

	var onSpriteRestart = function (event) {
		if (animator) {
			animator.playSequence(animator.sequenceName);
		}
	}

	var onSpriteLoopChanged = function (event) {
		store.set('CbSpriteLoop', $spriteLoop.is(':checked'));
	}



	var restoreValue = function (id, applyHandler) {
		store.get(id, function (ok, val) {
			if (ok) {
				$('#' + id).val(val);
				if (applyHandler)
					applyHandler(null, val);
			}
		});
	}
				
	var $lastStored = null;
	var storeValue = function (id) {
		$lastStored = $('#' + id);
		store.set(id, $lastStored.val());
	}

	var spriteOnLoad = function () {
		sprite.update();
		onSpriteAnimationDataListChanged(null);
		onColorChanged(null);
	}

	var paint = function (ticker) {
		if(animator && !animator.isPaused) {
			animator.next(ticker.lastTicksElapsed);

			if (animator.finished) {
				if ($spriteLoop.is(':checked')) {
					animator.play();
				} else {
					animator.pause();
				}
			}
		}
						
		if (sprite.imgLoaded) {
			sprite.update();
		}
	}

	//
	// ========================
	//

	var scene = sjs.Scene({
		parent: $('#Scene')[0],
		autoPause: false,
		w: $('#Scene').width(),
		h: $('#Scene').height(),
	});

	var layer = scene.Layer('SpritesTestground', {
		useCanvas: true,
		//autoClear: false,
	});

	var sprite = scene.Sprite('', layer);
	sprite.position(scene.w / 2, scene.h / 2);
	//sprite.update();

	sprite.onload = spriteOnLoad;

	var ticker = scene.Ticker(paint, { tickDuration: 10 });
	ticker.run();

	var animData = null;
	var animator = null;
	var selectedSequence = '';

	// For debugging.
	window.scene = scene;
	window.sprite = sprite;

	var store = new Persist.Store('SpriteTester');

	$('#BtnSpriteFolderSelect').click(onSpriteFolderSelected);
	$('#Color').on('change', onColorChanged);
	$('#ColorBG').on('change', onColorBGChanged);
	$('#BtnBackgroundSelect').click(onBackgroundSelected);
	$('#BtnBackgroundClear').click(onBackgroundCleared);
	$('#BackgroundImageX').click(onBackgroundOffsetChanged);
	$('#BackgroundImageY').click(onBackgroundOffsetChanged);
	$('#BtnSpriteAnimationDataSave').click(onSpriteAnimationDataSaved);
	$('#BtnSpriteAnimationDataToggleVisible').click(onSpriteAnimationDataToggleVisible);
	$('#SpriteAnimationDataList').click(onSpriteAnimationDataListChanged);

	$('#BtnSpritePlay').click(onSpritePlay);
	$('#BtnSpritePause').click(onSpritePause);
	$('#BtnSpriteRestart').click(onSpriteRestart);
	$('#CbSpriteLoop').on('change', onSpriteLoopChanged);

	var $scene = $('#Scene');
	var $color = $('#Color');
	var $lbColor = $('#LbColor');
	var $spriteFolder = $('#SpriteFolderPath');
	var $spriteAnimationDataList = $('#SpriteAnimationDataList');
	var $spriteAnimationDataError = $('#SpriteAnimationDataError');

	var $spriteLoop = $('#CbSpriteLoop');


	//
	// Restore values
	//
	store.get('CbSpriteLoop', function (ok, val) {
			if (ok) {
				// cause val is string, like: "false".
				$spriteLoop.prop('checked', JSON.parse(val));
			}
		});

	restoreValue('SpriteAnimationDataList', onSpriteAnimationDataListChanged);
	restoreValue('SpriteAnimationData', onSpriteAnimationDataSaved);	// This must be before SpriteFolderPath
	restoreValue('SpriteFolderPath', onSpriteFolderSelected);
	restoreValue('Color', onColorChanged);
	restoreValue('ColorBG', onColorBGChanged);
	restoreValue('BackgroundImageX', null);								// Offsets must be before bg image path
	restoreValue('BackgroundImageY', onBackgroundOffsetChanged);
	restoreValue('BackgroundImagePath', onBackgroundSelected);
});

