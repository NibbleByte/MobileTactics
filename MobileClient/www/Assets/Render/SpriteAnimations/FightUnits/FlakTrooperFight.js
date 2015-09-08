
// TODO: other units are binded to PeaceKeeper animations at the bottom of this file.
SpriteAnimations.FightUnits.FlakTrooper = {

	resourcePath: 'FlakTrooper.png',

	frameWidth: 95,
	frameHeight: 72,
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
			framesPerRow: 5,
			frames: 7,
		},
		
		{
			name: 'Run',
			speed: 10,
			startX: 0,
			startY: 0,
			framesPerRow: 5,
			frames: 7,
			wrapMode: Animator.WrapMode.Loop,
		},

		{
			name: 'Attack',
			speed: 10,
			startX: 0,
			startY: 0,
			framesPerRow: 5,
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
SpriteAnimations.FightUnits.ScrapTank = $.extend(true, {}, SpriteAnimations.FightUnits.FlakTrooper);
SpriteAnimations.FightUnits.Mech = $.extend(true, {}, SpriteAnimations.FightUnits.FlakTrooper);
SpriteAnimations.FightUnits.Sting = $.extend(true, {}, SpriteAnimations.FightUnits.FlakTrooper);
