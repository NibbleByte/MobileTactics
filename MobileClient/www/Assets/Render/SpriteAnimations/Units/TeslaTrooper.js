
SpriteAnimations.Units.TeslaTrooper = {

	resourcePath: 'TeslaTrooper.png',
	
	frameWidth: 64,
	frameHeight: 64,
	anchorX: Animator.AnchorX.Center,
	anchorY: Animator.AnchorY.Center,
	
	framesPerRow: 15,
	speed: 10,

	params: {
		forwardDirection: -1,
	},
	
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