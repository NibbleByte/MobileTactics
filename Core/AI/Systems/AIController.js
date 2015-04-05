//===============================================
// AIController
// The ai controller.
//===============================================
"use strict";

var AIController = function (m_world, m_executor) {
	
	//
	// Entity system initialize
	//
	this.initialize = function () {

	};


}

ECS.EntityManager.registerSystem('AIController', AIController);
SystemsUtils.supplySubscriber(AIController);