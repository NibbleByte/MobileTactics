
SpriteAnimations.Units.Comanche = {

	resourcePath: 'Comanche.png',
	
	frameWidth: 80,
	frameHeight: 80,
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