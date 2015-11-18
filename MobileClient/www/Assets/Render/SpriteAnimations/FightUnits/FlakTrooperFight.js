
// TODO: other units are binded to PeaceKeeper animations at the bottom of this file.
SpriteAnimations.FightUnits.FlakTrooper = {

	resourcePath: 'FlakTrooper.png',

	frameWidth: 95,
	frameHeight: 72,
	framesPerRow: 5,
	anchorX: 46,
	anchorY: Animator.AnchorY.Bottom,
	
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
			frames: 7,
		},
		
		{
			name: 'Run',
			speed: 10,
			startX: 0,
			startY: 0,
			frames: 7,
			wrapMode: Animator.WrapMode.Loop,
		},

		{
			name: 'Attack',
			speed: 10,
			startX: 0,
			startY: 0,
			frames: 7,

			events: [
				
				{
					frame: 5,
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
SpriteAnimations.FightUnits.Biker = $.extend(true, {}, SpriteAnimations.FightUnits.FlakTrooper);
//SpriteAnimations.FightUnits.ScrapTank = $.extend(true, {}, SpriteAnimations.FightUnits.FlakTrooper);
SpriteAnimations.FightUnits.Mech = $.extend(true, {}, SpriteAnimations.FightUnits.FlakTrooper);
SpriteAnimations.FightUnits.Sting = $.extend(true, {}, SpriteAnimations.FightUnits.FlakTrooper);


SpriteAnimations.FightUnits.ScrapTank = {

	resourcePath: 'ScrapTank.png',

	frameWidth: 186,
	frameHeight: 176,
	framesPerRow: 5,
	speed: 14,
	anchorX: Animator.AnchorY.Center,
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
			name: 'Run',
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