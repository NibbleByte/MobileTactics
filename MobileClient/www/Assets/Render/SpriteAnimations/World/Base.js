
SpriteAnimations.World.Base = {

	resourcePath: 'Base.png',
	
	frameWidth: 64,
	frameHeight: 64,

	speed: 16,
	
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
			startIndex: 1,
			frames: 5,
			wrapMode: Animator.WrapMode.Loop,
		},
	]
};