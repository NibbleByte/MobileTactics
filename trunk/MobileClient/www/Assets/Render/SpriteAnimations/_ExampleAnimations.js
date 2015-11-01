
SpriteAnimations._ExampleAnimations = {

	resourcePath: 'Foo.png',
	
	frameWidth: 64,
	frameHeight: 64,
	anchorX: 32,
	anchorY: 32,
	
	framesPerRow: 36,
	speed: 10,
	
	sequences: [
		{
			name: 'Idle',
			startIndex: 0,
			frames: 1,
		},
		
		{
			name: 'Idle0',
			startIndex: 1,	// If 0, can be omitted
			frames: 15,


			startX: 0,
			startY: 64,
			frameWidth: 80,
			frameHeight: 64,

			anchorX: 16,
			anchorY: 32,
	
			framesPerRow: 36,

			// Speed variants
			speed: 4,
			speed: function (index) {
				return index * 10;
			},

			frameSpeeds: [60, 5, 0, 30],	// NOTE: if 0 or less number of elements than fames, speed/speed(i) is used.
			frameSamples: [null, 4, null, null, 5, 2, 1, 3], // null - use original. Calculates frame based on the index.
		},
		
		{
			name: 'Idle1',
			startIndex: 16,
			frames: 15,
			events: [
				{
					// NOTE: 0th frame is ignored. Don't use it.
					// NOTE2: when repeating animation, frame is the current frame, not the total frames.
					//		  i.e. it will be called repeatedly every time that frame is shown.
					frame: 14,
					event: 'TestFrame',
					params: {
						WeaponType: 0
					}
				},

				{
					// NOTE: for repeating animations, elapsed time is the total elapsed time.
					//		 Can't be more than the repeat duration.
					elapsed: 2560,
					event: 'TestElapsed',
					params: {
						WeaponType: 0
					}
				},

				{
					// NOTE: normalized time doesn't make sense for endlessly repeating animations.
					timeNormalized: 0.75,
					event: 'TestTimeNormalized',
					params: {
						WeaponType: 0
					}
				},
			],

			//wrapMode: Animator.WrapMode.Loop,
			//duration: 13000,
		},
		
		{
			name: 'Attack',
			startIndex: 31,
			frames: 5,
			wrapMode: Animator.WrapMode.Loop,
			duration: 3000,
		},

		{
			name: 'AttackDefending',
			startIndex: 36,
			frames: 6,
			wrapMode: Animator.WrapMode.Loop,
			duration: 2500,
		},

		{
			name: 'Die',
			startIndex: 44,
			frames: 15,
			wrapMode: Animator.WrapMode.ClampForever,
		},
		
	]
};