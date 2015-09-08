
SpriteAnimations.Units.FlakTrooper = {

	resourcePath: 'FlakTrooper.png',
	
	frameWidth: 95,
	frameHeight: 72,
	anchorX: 46,
	anchorY: 46,
	
	sequences: [
		{
			name: 'Idle',
			startX: 0,
			startY: 0,
			startIndex: 4,
			frames: 1,
		},
		
		{
			name: 'Idle0',
			speed: 10,
			startX: 0,
			startY: 0,
			framesPerRow: 5,
			frames: 7,
		},
		
		{
			name: 'Attack',
			speed: 10,
			startX: 0,
			startY: 0,
			framesPerRow: 5,
			frames: 7,
			wrapMode: Animator.WrapMode.Loop,
			duration: 3000,
		},
		
	]
};