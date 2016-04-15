
SpriteAnimations.World.Minerals = {

	resourcePath: 'Minerals.png',
	
	frameWidth: 64,
	frameHeight: 64,
	
	framesPerRow: 4,

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
			frames: 4,
			wrapMode: Animator.WrapMode.OnceReverse,
		},
		
		{
			name: 'Idle-Empire',
			startIndex: 4,
			frames: 1,
		},

		{
			name: 'Idle-Empire-0',
			startIndex: 4,
			frames: 1,
			wrapMode: Animator.WrapMode.OnceReverse,
		},

		{
			name: 'Idle-JunkPeople',
			startIndex: 8,
			frames: 1,
		},

		{
			name: 'Idle-JunkPeople-0',
			startIndex: 8,
			frames: 4,
			wrapMode: Animator.WrapMode.OnceReverse,
		},
	]
};