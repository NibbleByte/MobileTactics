
SpriteAnimations.Units.PeaceKeeper = {

	resourcePath: 'PeaceKeeper.png',
	
	frameWidth: 111,
	frameHeight: 72,
	framesPerRow: 4,
	anchorX: 28,
	anchorY: 46,
	
	sequences: [
		{
			name: 'Idle',
			startX: 0,
			startY: 144,
			startIndex: 1,
			frames: 1,
		},
		
		{
			name: 'Idle0',
			speed: 20,
			startX: 0,
			startY: 0,
			frames: 7,
		},
		
		{
			name: 'Attack',
			speed: 10,
			startX: 0,
			startY: 0,
			frames: 7,
			wrapMode: Animator.WrapMode.Loop,
			duration: 3000,
		},
		
	]
};