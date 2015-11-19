
SpriteAnimations.FightUnits.UnitDeathFight = {

	resourcePath: 'Assets-Scaled/Render/Images/FightUnits/UnitDeath.png',
	
	frameWidth: 177,
	frameHeight: 177,
	anchorX: Animator.AnchorX.Center,
	anchorY: 130,
	
	framesPerRow: 5,
	speed: 5,
	
	sequences: [
		{
			name: 'Boom',
			startIndex: 0,
			frames: 24,
			wrapMode: Animator.WrapMode.OnceEnd,

			events: [
				
				{
					frame: 4,
					event: FightRenderingEvents.Animations.DIES_HIDE_UNIT,
				},
			],
		},
	]
};