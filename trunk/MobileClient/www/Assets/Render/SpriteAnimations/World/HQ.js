
SpriteAnimations.World.HQ = {

	resourcePath: 'HQ.png',
	
	frameWidth: 64,
	frameHeight: 80,

	anchorY: 16,
	
	framesPerRow: 0,

	speed: 20,

	params: {
		playIdleConstant: true,
	},
	
	sequences: [
		{
			name: 'Idle',
			startIndex: 0,
			frames: 1,
		},
		
		{
			name: 'Idle0',
			startIndex: 0,
			frames: 2,
			wrapMode: Animator.WrapMode.Loop,
		},
	]
};