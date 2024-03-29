
// TODO: other units are binded to PeaceKeeper animations at the bottom of this file.
SpriteAnimations.FightUnits.FlakTrooper = {

	resourcePath: 'FlakTrooper.png',

	frameWidth: 180,
	frameHeight: 170,
	framesPerRow: 4,
	anchorX: Animator.AnchorX.Center,
	anchorY: 140,
	
	sequences: [
		{
			name: 'Idle',
			startIndex: 0,
			frames: 1,
		},
		
		
		{
			name: 'Idle0',
			speed: 10,
			startIndex: 0,
			frames: 4,
		},
		
		{
			name: 'Run',
			speed: 8,
			startIndex: 4,
			frames: 8,
			wrapMode: Animator.WrapMode.Loop,
		},

		{
			name: 'Attack',
			speed: 9,
			startIndex: 12,
			frames: 15,
			frameSpeeds: [0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 14, 12 ],

			events: [
				
				{
					frame: 6,
					event: FightRenderingEvents.Animations.FIRE,
					params: {
						weaponType: FightUnitWeaponType.RocketLauncher,
						final: false,
					}
				},

				{
					frame: 12,
					event: FightRenderingEvents.Animations.FIRE,
					params: {
						weaponType: FightUnitWeaponType.Pistols,
						final: true,
					}
				},
			],
		},

	]
};


SpriteAnimations.FightUnits.Biker = {

	resourcePath: 'Biker.png',

	frameWidth: 180,
	frameHeight: 170,
	framesPerRow: 4,
	speed: 7,
	anchorX: Animator.AnchorX.Center,
	anchorY: 140,
	
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
		},

		{
			name: 'Attack',
			startIndex: 4,
			frames: 8,
			frameSamples: [null, null, null, null, 0, 1, 2, 3],

			events: [
				
				{
					frame: 2,
					event: FightRenderingEvents.Animations.FIRE,
					params: {
						weaponType: FightUnitWeaponType.Shotgun,
						final: false,
					}
				},

				{
					frame: 6,
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

SpriteAnimations.FightUnits.ScrapTank = {

	resourcePath: 'ScrapTank.png',

	frameWidth: 186,
	frameHeight: 176,
	framesPerRow: 5,
	speed: 14,
	anchorX: Animator.AnchorX.Center,
	anchorY: 150,
	
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
		},

		{
			name: 'Attack',
			startIndex: 4,
			frames: 5,
			speed: 9,

			events: [
				
				{
					frame: 2,
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

SpriteAnimations.FightUnits.Bomberman = {

	resourcePath: 'Bomberman.png',

	frameWidth: 186,
	frameHeight: 176,
	framesPerRow: 4,
	speed: 8,
	anchorX: Animator.AnchorX.Center,
	anchorY: 160,
	
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
		},

		{
			name: 'Attack',
			startIndex: 0,
			frames: 1,
			speed: 9,

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

SpriteAnimations.FightUnits.Sting = {

	resourcePath: 'Sting.png',

	frameWidth: 180,
	frameHeight: 170,
	framesPerRow: 6,
	speed: 12,
	anchorX: Animator.AnchorX.Center,
	anchorY: 150,
	
	sequences: [
		{
			name: 'Idle',
			startIndex: 0,
			frames: 1,
		},
		
		
		{
			name: 'Idle0',
			startIndex: 0,
			speed: 12,
			frames: 4,
		},

		{
			name: 'Attack',
			startIndex: 4,
			frames: 12,
			speed: 7,
			frameSamples: [null, null, null, null, null, 0, 1, 2, 3, 4, 5, 6],

			events: [
				
				{
					frame: 4,
					event: FightRenderingEvents.Animations.FIRE,
					params: {
						weaponType: FightUnitWeaponType.Shotgun,
						final: false,
					}
				},

				{
					frame: 7,
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