// Empire units animations on the map.

SpriteAnimations.Units.PeaceKeeper = {

	resourcePath: 'PeaceKeeper.png',

	frameWidth: 74,
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


SpriteAnimations.Units.Speeder = {

	resourcePath: 'Speeder.png',
	
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
			name: 'Attack',
			speed: 10,
			startIndex: 0,
			frames: 1,
		},
		
	]
};


SpriteAnimations.Units.HoverCannon = {

	resourcePath: 'HoverCannon.png',

	frameWidth: 70,
	frameHeight: 49,
	framesPerRow: 4,
	anchorX: Animator.AnchorX.Center,
	anchorY: 25,

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


SpriteAnimations.Units.Comanche = {

	resourcePath: 'Comanche.png',

	frameWidth: 80,
	frameHeight: 80,
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
			name: 'Attack',
			speed: 10,
			startIndex: 0,
			frames: 1,
		},

	]
};


SpriteAnimations.Units.IonDrone = {

	resourcePath: 'IonDrone.png',

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