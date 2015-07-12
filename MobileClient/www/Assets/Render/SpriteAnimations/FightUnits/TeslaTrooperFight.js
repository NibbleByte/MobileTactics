
// TODO: RhinoTank + WarMiner are binded to TeslaTrooper animations at the bottom of this file.
SpriteAnimations.FightUnits.TeslaTrooper = {

	resourcePath: 'elec.png',

	anchorX: Animator.AnchorX.Center,
	anchorY: Animator.AnchorY.Bottom,
	
	sequences: [
		{
			name: 'Idle',
			startX: 0,
			startY: 461,
			frameWidth: 98,
			frameHeight: 73,
			frames: 1,
		},
		
		
		{
			name: 'Idle0',
			speed: 20,
			startX: 0,
			startY: 461,
			frameWidth: 98,
			frameHeight: 73,
			frames: 4,
		},
		
		/*
		{
			name: 'Idle0',
			speed: 8,
			startX: 0,
			startY: 535,
			frameWidth: 150,
			frameHeight: 150,
			framesPerRow: 3,
			frames: 7,
		},
		*/
		
		{
			name: 'Run',
			speed: 10,
			startX: 0,
			startY: 0,
			anchorX: Animator.AnchorX.Center,
			frameWidth: 102,
			frameHeight: 78,
			framesPerRow: 4,
			frames: 8,
			wrapMode: Animator.WrapMode.Loop,
		},

		{
			name: 'Attack',
			speed: 10,
			startX: 0,
			startY: 157,
			anchorX: 49,
			frameWidth: 134,
			frameHeight: 78,
			framesPerRow: 3,
			frames: 6,

			events: [
				{
					frame: 1,
					event: FightRenderingEvents.Animations.FIRE,
					params: {
						weaponType: FightUnitWeaponType.Pistols,
					}
				},
				
				{
					frame: 4,
					event: FightRenderingEvents.Animations.FIRE,
					params: {
						weaponType: FightUnitWeaponType.Pistols,
						final: true,
					}
				},
			],
		},

		{
			name: 'Hurt',
			speed: 10,
			startX: 0,
			startY: 314,
			frameWidth: 98,
			frameHeight: 73,
			framesPerRow: 4,
			frames: 8,
		},
		
	]
};

// TODO: These units don't have sprites yet. Remove this when they do!
SpriteAnimations.FightUnits.RhinoTank = $.extend(true, {}, SpriteAnimations.FightUnits.TeslaTrooper);
SpriteAnimations.FightUnits.WarMiner = $.extend(true, {}, SpriteAnimations.FightUnits.TeslaTrooper);
