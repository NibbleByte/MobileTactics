//===============================================
// ActionsRenderingSystem
// Animate actions, right before being executed.
//===============================================
"use strict";

var ActionsRenderingSystem = function (m_executor, m_battleSystem) {
	var self = this;
			
	//
	// Entity system initialize
	//
	this.initialize = function () {
		self._eworldSB.subscribe(ClientEvents.Controller.ACTION_PREEXECUTE, onActionPreExecute);
		self._eworldSB.subscribe(ClientEvents.Controller.ACTIONS_OFFERED, onActionsOffered);
		self._eworldSB.subscribe(ClientEvents.Controller.ACTIONS_CLEARED, onActionsCleared);
	}
	
	var onActionPreExecute = function(action) {
		
		var preExecutorClass = m_actionPreExecutors[action.actionType.actionName]
							|| ActionsRenderingSystem.ActionExecutors.DefaultExecutor;
		
		var preExecutor = new preExecutorClass(m_executor, self._eworld, action);
		preExecutor.preExecute();
	}

	var onActionsOffered = function(goActions) {
		onActionsCleared();

		if (goActions.actions.length == 0)
			return;
		
		m_selectedGOActions = goActions;

		GameExecutor.iterateOverActionTiles(m_selectedGOActions.actions, ActionsRender.highlightTileAction);

		iterateAttackedUnit(m_selectedGOActions, renderBattleOutcomeOperation);
	}

	var onActionsCleared = function() {
		
		if (!m_selectedGOActions)
			return;

		GameExecutor.iterateOverActionTiles(m_selectedGOActions.actions, ActionsRender.unHighlightTile);

		iterateAttackedUnit(m_selectedGOActions, clearBattleOutcomeOperation);

		m_selectedGOActions = null;
	}

	var iterateAttackedUnit = function (goActions, operation) {
		var attackAction = goActions.getActionByType(Actions.Classes.ActionAttack);

		if (!attackAction)
			return;

		for(var i = 0; i < attackAction.availableTiles.length; ++i) {
			
			var enemy = attackAction.availableTiles[i].CTile.placedObjects[0];
			if (Utils.assert(enemy, 'Attack noone?'))
				continue;


			operation(goActions.go, enemy);
		}
	}

	var renderBattleOutcomeOperation = function (unit, enemy) {
		var outcome = m_battleSystem.predictOutcome(unit, enemy);

		if (outcome.damageToDefender > 0) {
			enemy.CUnitRendering.$damage.text('-' + outcome.damageToDefender);
			RenderUtils.addTextOutline(enemy.CUnitRendering.$damage);
		}

		if (outcome.damageToAttacker > 0) {
			enemy.CUnitRendering.$loss.text('-' + outcome.damageToAttacker);
			RenderUtils.addTextOutline(enemy.CUnitRendering.$loss);
		}
	}

	var clearBattleOutcomeOperation = function (unit, enemy) {
		enemy.CUnitRendering.$damage.empty();
		enemy.CUnitRendering.$loss.empty();
	}
	
	//
	// Private
	//
	var m_actionPreExecutors = {};
	var m_selectedGOActions = null;
	
	
	//m_actionPreExecutors[Actions.Classes.ActionAttack.actionName] = ActionsRenderingSystem.ActionExecutors.AttackExecutor;
	m_actionPreExecutors[Actions.Classes.ActionAttack.actionName] = ActionsRenderingSystem.ActionExecutors.AttackFightExecutor;
}

ECS.EntityManager.registerSystem('ActionsRenderingSystem', ActionsRenderingSystem);
SystemsUtils.supplySubscriber(ActionsRenderingSystem);


// Different action renderers.
ActionsRenderingSystem.ActionExecutors = {};

// Default rendering, executes the action directly.
ActionsRenderingSystem.ActionExecutors.DefaultExecutor = function (m_executor, m_eworld, m_action) {
	var self = this;
	
	this.preExecute = function () {
		m_eworld.trigger(ClientEvents.Controller.ACTION_EXECUTE, m_action);
	};
}

// Attack rendering, executes fight animation for involved units.
ActionsRenderingSystem.ActionExecutors.AttackFightExecutor = function (m_executor, m_eworld, m_action) {
	var self = this;
	var m_eworldSB = m_eworld.createSubscriber();
	var defaultExecutor = new ActionsRenderingSystem.ActionExecutors.DefaultExecutor(m_executor, m_eworld, m_action);

	this.preExecute = function () {

		var attacker = m_action.placeable;
		var defender = m_action.appliedTile.CTile.placedObjects[0];

		var attackerForward = getForwardDirection(attacker);
		var defenderForward = getForwardDirection(defender);

		// Flip sprites to face one another.
		var attackerSprite = attacker.CTilePlaceableRendering.sprite;
		var defenderSprite = defender.CTilePlaceableRendering.sprite;
		if (attackerSprite.x < defenderSprite.x) {
			attackerSprite.setXScale(-attackerForward);
			defenderSprite.setXScale(defenderForward);
		} else {
			attackerSprite.setXScale(attackerForward);
			defenderSprite.setXScale(-defenderForward);
		}
		attackerSprite.update();
		defenderSprite.update();

		m_eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.Units);

		FightRenderingManager.visualizeBattle(m_eworld, attacker, defender);

		m_eworldSB.subscribe(RenderEvents.FightAnimations.FIGHT_FINISHED, onFightFinished);
	};

	// HACK: Just till all sprites are fixed to face the same direction.
	var getForwardDirection = function (placeable) {

		if (placeable.CAnimations) {
			var animator = placeable.CAnimations.animators[UnitRenderingSystem.MAIN_ANIM];

			return animator.params.forwardDirection || 1;
		}

		return 1;
	}

	var onFightFinished = function () {
		defaultExecutor.preExecute();
		m_eworldSB.unsubscribeAll();
	}
}

// Attack rendering, executes attack animation for both units.
// When both animations are done, executes the action itself.
ActionsRenderingSystem.ActionExecutors.AttackExecutor = function (m_executor, m_eworld, m_action) {
	var self = this;
	var m_eworldSB = m_eworld.createSubscriber();
	var defaultExecutor = new ActionsRenderingSystem.ActionExecutors.DefaultExecutor(m_executor, m_eworld, m_action);
	
	var m_waitedAnimations = 0;
	
	this.preExecute = function () {
		
		var attacker = m_action.placeable;
		var defender = m_action.appliedTile.CTile.placedObjects[0];

		var distance = m_eworld.extract(GameWorld).getDistance(attacker.CTilePlaceable.tile, defender.CTilePlaceable.tile);
		
		var attackerForward = getForwardDirection(attacker);
		var defenderForward = getForwardDirection(defender);

		// Start animations and wait for them to finish. Only if units are in range.
		playAttackAnimation(attacker);
		if (defender.CStatistics.statistics['AttackRange'] >= distance)
			playAttackAnimation(defender);
		
		
		// Flip sprites to face one another.
		var attackerSprite = m_action.placeable.CTilePlaceableRendering.sprite;
		var defenderSprite = m_action.appliedTile.CTile.placedObjects[0].CTilePlaceableRendering.sprite;
		if (attackerSprite.x < defenderSprite.x) {
			attackerSprite.setXScale(-attackerForward);
			defenderSprite.setXScale(defenderForward);
		} else {
			attackerSprite.setXScale(attackerForward);
			defenderSprite.setXScale(-defenderForward);
		}
		attackerSprite.update();
		defenderSprite.update();

		m_eworld.trigger(RenderEvents.Layers.REFRESH_LAYER, WorldLayers.LayerTypes.Units);
		
		if (m_waitedAnimations != 0) {
			m_eworldSB.subscribe(RenderEvents.Animations.ANIMATION_FINISHED, onAnimationFinished);
		} else {
			defaultExecutor.preExecute();
		}
	};
	
	
	var playAttackAnimation = function (placeable) {
		if (placeable.CAnimations) {
			var animator = placeable.CAnimations.animators[UnitRenderingSystem.MAIN_ANIM];
			
			if (animator.hasSequence('Attack')) {
				animator.playSequence('Attack');
				++m_waitedAnimations;

			}

			return animator.params.forwardDirection || 1;
		}

		return 1;
	}

	// HACK: Just till all sprites are fixed to face the same direction.
	var getForwardDirection = function (placeable) {

		if (placeable.CAnimations) {
			var animator = placeable.CAnimations.animators[UnitRenderingSystem.MAIN_ANIM];

			return animator.params.forwardDirection || 1;
		}

		return 1;
	}
	
	var finishAttackAnimation = function (placeable) {
		if (m_action.placeable == placeable || m_action.appliedTile.CTile.placedObjects[0] == placeable) {
			--m_waitedAnimations;
		}
	}
	
	var onAnimationFinished = function (params) {
		
		// When all affected units has finished their animations, execute the actual action.
		finishAttackAnimation(params.entity);
		
		if (m_waitedAnimations == 0) {
			defaultExecutor.preExecute();
			m_eworldSB.unsubscribeAll();
		}
	}
}

