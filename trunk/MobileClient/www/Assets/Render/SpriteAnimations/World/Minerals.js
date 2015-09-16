
SpriteAnimations.World.Minerals = {

	resourcePath: 'Minerals.png',
	
	frameWidth: 64,
	frameHeight: 64,
	
	framesPerRow: 0,

	speed: 12,
	
	sequences: [
		{
			name: 'Idle',
			startIndex: 0,
			frames: 1,
		},

		{
			name: 'Idle0',
			startIndex: 0,
			frames: 5,
			wrapMode: Animator.WrapMode.OnceReverse,
		},
	]
};