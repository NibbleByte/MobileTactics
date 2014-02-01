//===============================================
// PlayersData
// Holds players data.
//===============================================
"use strict";

var PlayersData = function (eworld) {
	this._eworld = eworld;
	this.players = [];	// Read-only field!
};
	
PlayersData.prototype.addPlayer = function (name, type, teamId) {
	
	var player = new Player(this.players.length, name, type, teamId || -1);
	this.players.push(player);
	
	this._eworld.trigger(GameplayEvents.Players.PLAYER_ADDED, player);
	
	return player;
}
	
PlayersData.prototype.clearPlayers = function () {
	this.players = [];
	
	this._eworld.trigger(GameplayEvents.Players.PLAYERS_CLEARED);
}
	
PlayersData.prototype.getPlayer = function (id) {
	return this.players[id];
}

PlayersData.prototype.getPlayingPlayersCount = function () {
	var count = 0;
	
	for(var i = 0; i < this.players.length; ++i) {
		if (this.players[i].isPlaying)
			 ++count;
	}
}
	
PlayersData.prototype.getFirstPlayingPlayer = function () {
	
	if (this.players.length == 0) {
		return null;
	}
	
	if (this.players[0].isPlaying)
		return this.players[0];
	
	return this.getNextPlayingPlayer(this.players[0]);
}
	
PlayersData.prototype.getNextPlayingPlayer = function (player) {
	var id = player.id;
	
	var nextId = (id + 1) % this.players.length;
	
	while(!this.players[nextId].isPlaying && id != nextId) {
		var nextId = (nextId + 1) % this.players.length;
	}
	
	// If got to the same player, he might not be playing as well.
	if (this.players[nextId].isPlaying) {
		return this.players[nextId];
	} else {
		return null;
	}
}

PlayersData.prototype.stopPlaying = function (player) {
	console.assert(player.isPlaying, 'Player have already stopped playing.');
	
	player.isPlaying = false;
	
	this._eworld.trigger(GameplayEvents.Players.PLAYER_STOPPED_PLAYING, player);
}
	
	
PlayersData.prototype.getRelation = function (player1, player2) {
	
	if (player1.teamId == player2.teamId && (player1.teamId != -1 || player1.id == player2.id)) {
		return PlayersData.Relation.Ally;
	}
	
	return PlayersData.Relation.Enemy;
}

PlayersData.prototype.onDeserialize = function (eworld) {
	
	this._eworld = eworld;
	
	this._eworld.trigger(GameplayEvents.Players.PLAYERS_CLEARED);
}

Serialization.registerClass(PlayersData, 'PlayersData');

PlayersData.BLACKBOARD_NAME = 'PlayersData';

PlayersData.Relation = {
		Enemy: 0,
		Neutral: 0,
		Ally: 0,
	}
Enums.enumerate(PlayersData.Relation);

// This class is read-only data.
var Player = function (id, name, type, teamId) {
	this.id = id;
	this.name = name;
	this.teamId = teamId;
	this.type = type;
	this.isPlaying = true;
	
};

Serialization.registerClass(Player, 'Player');

Player.Types = {
		Human: 0,
		CPU: 0,
}
Enums.enumerate(Player.Types);
