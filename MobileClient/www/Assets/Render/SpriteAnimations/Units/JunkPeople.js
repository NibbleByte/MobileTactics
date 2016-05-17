
SpriteAnimations.Units.FlakTrooper = {

	resourcePath: 'FlakTrooper.png',
	
	frameWidth: 74,
	frameHeight: 72,
	framesPerRow: 5,
	anchorX: Animator.AnchorX.Center,
	anchorY: 46,
	
	sequences: [
		{
			name: 'Idle',
			startIndex: 0,
			frames: 1,
		},
		
		{
			name: 'Idle0',
			speed: 15,
			startIndex: 0,
			frames: 4,
			frameSamples: [null, null, null, 1],
		},
		
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


SpriteAnimations.Units.Biker = {

	resourcePath: 'Biker.png',

	frameWidth: 78,
	frameHeight: 72,
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
			name: 'Idle0',
			speed: 15,
			startIndex: 0,
			frames: 4,
			frameSamples: [null, null, null, 1],
		},

		{
			name: 'Attack',
			speed: 10,
			startIndex: 0,
			frames: 1,
		},

	]
};


SpriteAnimations.Units.ScrapTank = {

	resourcePath: 'ScrapTank.png',

	frameWidth: 70,
	frameHeight: 57,
	framesPerRow: 4,
	anchorX: 30,
	anchorY: 35,

	sequences: [
		{
			name: 'Idle',
			startIndex: 0,
			frames: 1,
		},

		{
			name: 'Idle0',
			speed: 15,
			startIndex: 0,
			frames: 4,
		},

		{
			name: 'Attack',
			speed: 10,
			startIndex: 0,
			frames: 1,
		},

	]
};


SpriteAnimations.Units.Sting = {

	resourcePath: 'Sting.png',

	frameWidth: 78,
	frameHeight: 72,
	framesPerRow: 4,
	anchorX: 42,
	anchorY: 40,

	sequences: [
		{
			name: 'Idle',
			startIndex: 0,
			frames: 1,
		},

		{
			name: 'Idle0',
			speed: 15,
			startIndex: 0,
			frames: 4,
			frameSpeeds: [0, 0, 55],
			frameSamples: [null, null, null, 1],
		},

		{
			name: 'Attack',
			speed: 10,
			startIndex: 0,
			frames: 1,
		},

	]
};