
// TODO: other units are binded to Nibbler animations at the bottom of this file.
SpriteAnimations.FightUnits.Nibbler = {

	resourcePath: 'Nibbler.png',

	frameWidth: 180,
	frameHeight: 170,
	framesPerRow: 5,
	anchorX: Animator.AnchorX.Center,
	anchorY: 154,
	
	sequences: [
		{
			name: 'Idle',
			startX: 0,
			startY: 0,
			frames: 1,
		},
		
		
		{
			name: 'Idle0',
			speed: 20,
			startX: 0,
			startY: 0,
			frames: 1,
		},
		
		{
			name: 'Run',
			speed: 10,
			startX: 0,
			startY: 0,
			frames: 1,
			wrapMode: Animator.WrapMode.Loop,
		},

		{
			name: 'Attack',
			speed: 10,
			startX: 0,
			startY: 0,
			frames: 1,

			events: [
				
				{
					frame: 0,
					event: FightRenderingEvents.Animations.FIRE,
					params: {
						weaponType: FightUnitWeaponType.RocketLauncher,
						final: true,
					}
				},
			],
		},

	]
};


SpriteAnimations.FightUnits.DarkAdroit = {

	resourcePath: 'DarkAdroit.png',

	frameWidth: 180,
	frameHeight: 170,
	framesPerRow: 5,
	anchorX: Animator.AnchorX.Center,
	anchorY: 146,
	
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
			frames: 1,
		},
		
		{
			name: 'Run',
			speed: 15,
			startIndex: 0,
			frames: 1,
		},

		{
			name: 'Attack',
			speed: 10,
			startIndex: 0,
			frames: 1,

			events: [
				
				{
					frame: 0,
					event: FightRenderingEvents.Animations.FIRE,
					params: {
						weaponType: FightUnitWeaponType.Shotgun,
						final: true,
					}
				},
			],
		},

	]
};