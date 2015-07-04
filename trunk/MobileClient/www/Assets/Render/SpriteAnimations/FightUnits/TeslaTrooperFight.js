
// TODO: RhinoTank + WarMiner are binded to TeslaTrooper animations at the bottom of this file.
SpriteAnimations.FightUnits.TeslaTrooper = {

	resourcePath: 'elec.png',

	anchorX: Animator.AnchorX.Center,
	anchorY: Animator.AnchorY.Bottom,

	speed: 20,
	
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
			name: 'Attack',
			startX: 0,
			startY: 157,
			anchorX: 49,
			frameWidth: 134,
			frameHeight: 78,
			framesPerRow: 3,
			frames: 6,
		},

		{
			name: 'Hurt',
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
