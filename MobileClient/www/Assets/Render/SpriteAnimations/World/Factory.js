
SpriteAnimations.World.Factory = {

	resourcePath: 'Factory.png',
	
	frameWidth: 64,
	frameHeight: 64,

	speed: 16,

	params: {
		playIdleDirectly: true,
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
			frames: 5,
			wrapMode: Animator.WrapMode.Loop,
		},
	]
};