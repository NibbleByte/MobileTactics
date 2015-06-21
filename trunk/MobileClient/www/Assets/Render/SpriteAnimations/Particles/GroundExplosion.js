
SpriteAnimations.Particles.GroundExplosion = {

	resourcePath: 'Assets-Scaled/Render/Images/Particles/GroundExplosion.png',
	
	frameWidth: 50,
	frameHeight: 128,
	anchorX: 25,
	anchorY: 96,
	
	framesPerRow: 20,
	speed: 5,
	
	sequences: [
		{
			name: 'Boom',
			startIndex: 0,
			frames: 20,
			wrapMode: Animator.WrapMode.OnceEnd,
		},
	]
};