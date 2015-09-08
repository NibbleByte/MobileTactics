
// TODO: other units are binded to PeaceKeeper animations at the bottom of this file.
SpriteAnimations.FightUnits.PeaceKeeper = {

	resourcePath: 'PeaceKeeper.png',

	frameWidth: 111,
	frameHeight: 72,
	anchorX: 32,
	anchorY: Animator.AnchorY.Bottom,
	
	sequences: [
		{
			name: 'Idle',
			startX: 0,
			startY: 144,
			startIndex: 1,
			frames: 1,
		},
		
		
		{
			name: 'Idle0',
			speed: 20,
			startX: 0,
			startY: 144,
			frames: 4,
		},
		
		{
			name: 'Run',
			speed: 10,
			startX: 0,
			startY: 0,
			framesPerRow: 4,
			frames: 7,
			wrapMode: Animator.WrapMode.Loop,
		},

		{
			name: 'Attack',
			speed: 10,
			startX: 0,
			startY: 0,
			framesPerRow: 4,
			frames: 7,

			events: [
				
				{
					frame: 5,
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
SpriteAnimations.FightUnits.Ranger = $.extend(true, {}, SpriteAnimations.FightUnits.PeaceKeeper);
SpriteAnimations.FightUnits.HoverCannon = $.extend(true, {}, SpriteAnimations.FightUnits.PeaceKeeper);
SpriteAnimations.FightUnits.Comanche = $.extend(true, {}, SpriteAnimations.FightUnits.PeaceKeeper);
SpriteAnimations.FightUnits.IonDrone = $.extend(true, {}, SpriteAnimations.FightUnits.PeaceKeeper);
