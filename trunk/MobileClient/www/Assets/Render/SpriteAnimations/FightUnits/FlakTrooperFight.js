
// TODO: other units are binded to PeaceKeeper animations at the bottom of this file.
SpriteAnimations.FightUnits.FlakTrooper = {

	resourcePath: 'FlakTrooper.png',

	frameWidth: 180,
	frameHeight: 170,
	framesPerRow: 1,
	anchorX: Animator.AnchorX.Center,
	anchorY: 140,
	
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

// TODO: These units don't have sprites yet. Remove this when they do!
//SpriteAnimations.FightUnits.Biker = $.extend(true, {}, SpriteAnimations.FightUnits.FlakTrooper);
//SpriteAnimations.FightUnits.ScrapTank = $.extend(true, {}, SpriteAnimations.FightUnits.FlakTrooper);
//SpriteAnimations.FightUnits.Mech = $.extend(true, {}, SpriteAnimations.FightUnits.FlakTrooper);
//SpriteAnimations.FightUnits.Sting = $.extend(true, {}, SpriteAnimations.FightUnits.FlakTrooper);


SpriteAnimations.FightUnits.Biker = {

	resourcePath: 'Biker.png',

	frameWidth: 180,
	frameHeight: 170,
	framesPerRow: 5,
	speed: 14,
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
			frames: 1,
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

SpriteAnimations.FightUnits.Mech = {

	resourcePath: 'Mech.png',

	frameWidth: 180,
	frameHeight: 170,
	framesPerRow: 5,
	speed: 14,
	anchorX: Animator.AnchorX.Center,
	anchorY: 145,
	
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
			frames: 1,
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