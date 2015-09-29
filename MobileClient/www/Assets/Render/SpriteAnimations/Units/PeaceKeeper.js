
SpriteAnimations.Units.PeaceKeeper = {

	resourcePath: 'PeaceKeeper.png',
	
	frameWidth: 111,
	frameHeight: 72,
	framesPerRow: 4,
	anchorX: 28,
	anchorY: 46,

	params: {
		forwardDirection: -1,
	},
	
	sequences: [
		{
			name: 'Idle',
			startIndex: 1,
			frames: 1,
		},
		
		{
			name: 'Idle0',
			speed: 20,
			startIndex: 0,
			frames: 4,
		},
		
		{
			name: 'Attack',
			speed: 10,
			startIndex: 11,
			frames: 14,
		},
		
	]
};