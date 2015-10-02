
// TODO: other units are binded to PeaceKeeper animations at the bottom of this file.
SpriteAnimations.FightUnits.PeaceKeeper = {

	resourcePath: 'PeaceKeeper.png',

	frameWidth: 111,
	frameHeight: 72,
	framesPerRow: 4,
	anchorX: 32,
	anchorY: Animator.AnchorY.Bottom,
	
	sequences: [
		{
			name: 'Idle',
			startIndex: 1,
			frames: 1,
		},
		
		
		{
			name: 'Idle0',
			speed: 20,
			startIndex: 0,
			frames: 4,
		},
		
		{
			name: 'Run',
			speed: 10,
			startIndex: 5,
			frames: 7,
			wrapMode: Animator.WrapMode.Loop,
		},

		{
			name: 'Attack',
			speed: 11,
			frameSpeeds: [0, 0, 0, 0, 4, 4, 4, 0],
			startIndex: 11,
			frames: 14,

			events: [
				
				{
					frame: 4,
					event: FightRenderingEvents.Animations.FIRE,
					params: {
						weaponType: FightUnitWeaponType.Shotgun,
						final: true,
					}
				},
			],
		},

		{
			name: 'Taunt',
			speed: 20,
			startIndex: 25,
			frames: 7,
		},

	]
};

// TODO: These units don't have sprites yet. Remove this when they do!
SpriteAnimations.FightUnits.Ranger = $.extend(true, {}, SpriteAnimations.FightUnits.PeaceKeeper);
//SpriteAnimations.FightUnits.HoverCannon = $.extend(true, {}, SpriteAnimations.FightUnits.PeaceKeeper);
SpriteAnimations.FightUnits.Comanche = $.extend(true, {}, SpriteAnimations.FightUnits.PeaceKeeper);
SpriteAnimations.FightUnits.IonDrone = $.extend(true, {}, SpriteAnimations.FightUnits.PeaceKeeper);


SpriteAnimations.FightUnits.HoverCannon = {

	resourcePath: 'HoverCannon.png',

	frameWidth: 111,
	frameHeight: 78,
	framesPerRow: 4,
	anchorX: Animator.AnchorY.Center,
	anchorY: Animator.AnchorY.Bottom,
	
	sequences: [
		{
			name: 'Idle',
			startIndex: 0,
			frames: 1,
		},
		
		
		{
			name: 'Idle0',
			startIndex: 0,
			frames: 1,
		},
		
		{
			name: 'Run',
			frames: 1,
		},

		{
			name: 'Attack',
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

		{
			name: 'Taunt',
			startIndex: 0,
			frames: 1,
		},

	]
};
