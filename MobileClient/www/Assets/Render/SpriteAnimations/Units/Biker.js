
SpriteAnimations.Units.Biker = {

	resourcePath: 'Biker.png',
	
	frameWidth: 78,
	frameHeight: 72,
	framesPerRow: 4,
	anchorX: Animator.AnchorX.Center,
	anchorY: 40,

	sequences: [
		{
			name: 'Idle',
			startIndex: 0,
			frames: 1,
		},
		
		{
			name: 'Attack',
			speed: 10,
			startIndex: 0,
			frames: 1,
		},
		
	]
};