
SpriteAnimations.Units.Nibbler = {

	resourcePath: 'Nibbler.png',
	
	frameWidth: 111,
	frameHeight: 88,
	framesPerRow: 1,

	anchorX: Animator.AnchorX.Center,
	anchorY: Animator.AnchorY.Center,
	
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