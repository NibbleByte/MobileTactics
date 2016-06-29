
// TODO: other units are binded to PeaceKeeper animations at the bottom of this file.
SpriteAnimations.FightUnits.PeaceKeeper = {

	resourcePath: 'PeaceKeeper.png',

	frameWidth: 177,
	frameHeight: 186,
	framesPerRow: 5,
	anchorX: Animator.AnchorX.Center,
	anchorY: 144,
	
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
		
		/*
		{
			name: 'Run',
			speed: 10,
			startIndex: 4,
			frames: 8,
			wrapMode: Animator.WrapMode.Loop,
		},
		*/

		{
			name: 'Attack',
			speed: 7,
			startIndex: 4,
			frames: 17,
			//frameSamples: [null, null, null, null, null, null, null, null, null, null, 3, 4, 5, 6, 7, 8, 9, 3, 10, 11, 0],

			events: [
				
				{
					frame: 4,
					event: FightRenderingEvents.Animations.FIRE,
					params: {
						weaponType: FightUnitWeaponType.Shotgun,
					}
				},

				{
					frame: 10,
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

SpriteAnimations.FightUnits.Speeder = {

	resourcePath: 'Speeder.png',

	frameWidth: 211,
	frameHeight: 153,
	framesPerRow: 4,
	anchorX: 100,
	anchorY: 138,
	
	sequences: [
		{
			name: 'Idle',
			startIndex: 0,
			frames: 1,
		},
		
		
		{
			name: 'Idle0',
			speed: 6,
			startIndex: 0,
			frames: 6,
		},

		{
			name: 'Attack',
			speed: 6,
			startIndex: 6,
			frames: 12,
			frameSamples: [null, null, null, null, null, null, 0, 1, 2, 3, 4, 5],

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
					frame: 8,
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

SpriteAnimations.FightUnits.Comanche = {

	resourcePath: 'Comanche.png',

	frameWidth: 180,
	frameHeight: 170,
	framesPerRow: 5,
	anchorX: 98,
	anchorY: 154,
	
	sequences: [
		{
			name: 'Idle',
			startIndex: 0,
			frames: 1,
		},
		
		
		{
			name: 'Idle0',
			speed: 9,
			startIndex: 0,
			frames: 5,
		},

		{
			name: 'Attack',
			speed: 6,
			startIndex: 5,
			frames: 6,

			events: [
				
				{
					frame: 3,
					event: FightRenderingEvents.Animations.FIRE,
					params: {
						weaponType: FightUnitWeaponType.MachineGun,
						final: true,
					}
				},
			],
		},

	]
};


SpriteAnimations.FightUnits.HoverCannon = {

	resourcePath: 'HoverCannon.png',

	frameWidth: 180,
	frameHeight: 170,
	framesPerRow: 5,
	anchorX: 80,
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
			frames: 6,
		},

		{
			name: 'Attack',
			speed: 10,
			startIndex: 6,
			frames: 6,

			events: [
				
				{
					frame: 3,
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


SpriteAnimations.FightUnits.IonDrone = {

	resourcePath: 'IonDrone.png',

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
			speed: 6,
			startIndex: 0,
			frames: 8,
		},

		{
			name: 'Attack',
			speed: 3,
			startIndex: 8,
			frames: 8,

			events: [
				
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
