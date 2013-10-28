var SpriteAnimations = SpriteAnimations || {};

SpriteAnimations.TeslaTrooper = {

	resourcePath: 'TeslaTrooper.png',
	
	frameWidth: 64,
	frameHeight: 64,
	
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
		},
		
		{
			name: 'Attack',
			startIndex: 31,
			frames: 5,
			repeat: true,
			duration: 500,
		},
		
	]
};