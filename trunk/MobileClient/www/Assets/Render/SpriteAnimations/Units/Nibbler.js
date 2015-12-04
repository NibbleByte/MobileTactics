
SpriteAnimations.Units.Nibbler = {

	resourcePath: 'Nibbler.png',
	
	frameWidth: 74,
	frameHeight: 72,
	framesPerRow: 1,

	anchorX: Animator.AnchorX.Center,
	anchorY: 48,
	
	sequences: [
		{
			name: 'Idle',
			startIndex: 0,
			frames: 1,
		},
		
		{
			name: 'Idle0',
			speed: 10,
			frames: 1,
		},
		
		{
			name: 'Attack',
			frames: 1,
			wrapMode: Animator.WrapMode.Loop,
			duration: 3000,
		},
		
	]
};