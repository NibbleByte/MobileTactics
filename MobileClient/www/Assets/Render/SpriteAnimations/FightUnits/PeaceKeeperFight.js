
// TODO: other units are binded to PeaceKeeper animations at the bottom of this file.
SpriteAnimations.FightUnits.PeaceKeeper = {

	resourcePath: 'PeaceKeeper.png',

	frameWidth: 177,
	frameHeight: 186,
	framesPerRow: 5,
	anchorX: Animator.AnchorY.Center,
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
		
		{
			name: 'Run',
			speed: 10,
			startIndex: 4,
			frames: 8,
			wrapMode: Animator.WrapMode.Loop,
		},

		{
			name: 'Attack',
			speed: 7,
			startIndex: 12,
			frames: 21,
			frameSamples: [null, null, null, null, null, null, null, null, null, null, 3, 4, 5, 6, 7, 8, 9, 3, 10, 11, 0],

			events: [
				
				{
					frame: 6,
					event: FightRenderingEvents.Animations.FIRE,
					params: {
						weaponType: FightUnitWeaponType.Shotgun,
					}
				},

				{
					frame: 13,
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

// TODO: These units don't have sprites yet. Remove this when they do!
//SpriteAnimations.FightUnits.Ranger = $.extend(true, {}, SpriteAnimations.FightUnits.PeaceKeeper);
//SpriteAnimations.FightUnits.HoverCannon = $.extend(true, {}, SpriteAnimations.FightUnits.PeaceKeeper);
SpriteAnimations.FightUnits.Comanche = $.extend(true, {}, SpriteAnimations.FightUnits.PeaceKeeper);
SpriteAnimations.FightUnits.IonDrone = $.extend(true, {}, SpriteAnimations.FightUnits.PeaceKeeper);


SpriteAnimations.FightUnits.Ranger = {

	resourcePath: 'Ranger.png',

	frameWidth: 180,
	frameHeight: 170,
	framesPerRow: 5,
	anchorX: 80,
	anchorY: 138,
	
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
			name: 'Run',
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
