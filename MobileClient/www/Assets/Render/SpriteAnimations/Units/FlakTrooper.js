
SpriteAnimations.Units.FlakTrooper = {

	resourcePath: 'FlakTrooper.png',
	
	frameWidth: 74,
	frameHeight: 72,
	framesPerRow: 5,
	anchorX: Animator.AnchorX.Center,
	anchorY: 46,

	params: {
		forwardDirection: -1,
	},
	
	sequences: [
		{
			name: 'Idle',
			startIndex: 0,
			frames: 1,
		},
		
		/*
		{
			name: 'Idle0',
			speed: 10,
			startIndex: 0,
			frames: 7,
		},
		*/
		{
			name: 'Attack',
			speed: 10,
			startIndex: 0,
			frames: 1,
			wrapMode: Animator.WrapMode.Loop,
			duration: 3000,
		},
		
	]
};