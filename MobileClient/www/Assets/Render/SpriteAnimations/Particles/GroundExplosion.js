
SpriteAnimations.Particles.GroundExplosion = {

	resourcePath: 'Assets-Scaled/Render/Images/Particles/GroundExplosion.png',
	
	frameWidth: 50,
	frameHeight: 128,
	anchorX: Animator.AnchorX.Center,
	anchorY: Animator.AnchorY.Bottom,
	
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