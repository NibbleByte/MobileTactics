//===============================================
// ActionsRenderingSystem
// Animate actions, right before being executed.
//===============================================
"use strict";

var ActionsRenderingSystem = function (m_executor) {
	var self = this;
			
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(ClientEvents.Controller.ACTION_PREEXECUTE, onActionPreExecute);
	}
	
	var onActionPreExecute = function(event, action) {
		
		var preExecutorClass = m_actionPreExecutors[action.actionType.actionName]
							|| ActionsRenderingSystem.ActionExecutors.DefaultExecutor;
		
		var preExecutor = new preExecutorClass(m_executor, self._eworld, action);
		preExecutor.preExecute();
	}
	
	//
	// Private
	//
	var m_actionPreExecutors = {};	
	
	
	m_actionPreExecutors[Actions.Classes.ActionAttack.actionName] = ActionsRenderingSystem.ActionExecutors.AttackExecutor;
}

ECS.EntityManager.registerSystem('ActionsRenderingSystem', ActionsRenderingSystem);
SystemsUtils.supplySubscriber(ActionsRenderingSystem);


// Different action renderers.
ActionsRenderingSystem.ActionExecutors = {};

// Default rendering, executes the action directly.
ActionsRenderingSystem.ActionExecutors.DefaultExecutor = function (m_executor, m_eworld, m_action) {
	var self = this;
	
	this.preExecute = function () {
		var actions = m_executor.executeAction(m_action);
		
		m_eworld.trigger(ClientEvents.Controller.ACTIONS_OFFERED, [actions]);
	};
}

// Attack rendering, executes attack animation first for both units.
// When both animations are done, executes the action itself.
ActionsRenderingSystem.ActionExecutors.AttackExecutor = function (m_executor, m_eworld, m_action) {
	var self = this;
	var m_eworldSB = m_eworld.createSubscriber();
	var defaultExecutor = new ActionsRenderingSystem.ActionExecutors.DefaultExecutor(m_executor, m_eworld, m_action);
	
	var m_waitedAnimations = 0;
	
	this.preExecute = function () {
		
		// Start animations and wait for them to finish.
		playAttackAnimation(m_action.placeable);
		playAttackAnimation(m_action.appliedTile.CTile.placedObjects[0]);
		
		
		// Flip sprites to face one another.
		var attackerSprite = m_action.placeable.CTilePlaceableRendering.sprite;
		var defenderSprite = m_action.appliedTile.CTile.placedObjects[0].CTilePlaceableRendering.sprite;
		if (attackerSprite.x < defenderSprite.x) {
			attackerSprite.setXScale(-1);
			defenderSprite.setXScale(1);
		} else {
			attackerSprite.setXScale(1);
			defenderSprite.setXScale(-1);
		}
		attackerSprite.update();
		defenderSprite.update();
		
		if (m_waitedAnimations != 0) {
			m_eworldSB.subscribe(RenderEvents.Animations.ANIMATION_FINISHED, onAnimationFinished);
		} else {
			defaultExecutor.preExecute();
		}
	};
	
	
	var playAttackAnimation = function (placeable) {
		if (placeable.CAnimations) {
			var animator = placeable.CAnimations.animators[UnitRenderingSystem.MAIN_SPRITE];
			
			if (animator.hasSequence('Attack')) {
				animator.playSequence('Attack');
				++m_waitedAnimations;
			}
		}
	}
	
	var finishAttackAnimation = function (placeable) {
		if (m_action.placeable == placeable || m_action.appliedTile.CTile.placedObjects[0] == placeable) {
			--m_waitedAnimations;
		}
	}
	
	var onAnimationFinished = function (event, params) {
		
		// When all affected units has finished their animations, execute the actual action.
		finishAttackAnimation(params.entity);
		
		if (m_waitedAnimations == 0) {
			defaultExecutor.preExecute();
			m_eworldSB.unsubscribeAll();
		}
	}
}

