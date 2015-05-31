var SpriteAnimations = SpriteAnimations || {};

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
			startIndex: 1,
			frames: 15,
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