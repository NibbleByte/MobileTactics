var SpriteAnimations = SpriteAnimations || {};

SpriteAnimations.Base = {

	resourcePath: 'Base.png',
	
	frameWidth: 64,
	frameHeight: 64,
	
	framesPerRow: 0,

	speed: 10,
	
	sequences: [
		{
			name: 'Idle',
			startIndex: 0,
			frames: 1,
		},
		
		{
			name: 'Idle0',
			startIndex: 0,
			frames: 13,
		},
	]
};