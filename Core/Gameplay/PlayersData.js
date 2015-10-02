//===============================================
// PlayersData
// Holds players data.
//===============================================
"use strict";

var PlayersData = function (eworld) {
	this._eworld = eworld;
	this.players = [];	// Read-only field!
};

PlayersData.prototype.addPlayer = function (name, type, race, colorHue, teamId) {

	// Find next possible id.
	var nextId = 0;
	for(var i = 0; i < this.players.length; ++i) {
		if (nextId <= this.players[i].playerId)
			nextId = this.players[i].playerId + 1;
	}
	
	var player = new Player(nextId, name, type, race, colorHue, teamId || -1);
	this.players.push(player);
	
	this._eworld.trigger(GameplayEvents.Players.PLAYER_ADDED, player);
	
	return player;
}

PlayersData.prototype.removePlayer = function (player) {
	var success = this.players.remove(player);

	if (success) {
		this._eworld.trigger(GameplayEvents.Players.PLAYER_REMOVED, player);
	}

	return success;
}
	
PlayersData.prototype.clearPlayers = function () {
	this.players = [];
	
	this._eworld.trigger(GameplayEvents.Players.PLAYERS_CLEARED);
}
	
PlayersData.prototype.getPlayer = function (playerId) {

	for(var i = 0; i < this.players.length; ++i) {
		if (this.players[i].playerId == playerId)
			return this.players[i];
	}

	return null;
}

PlayersData.prototype.getPlayingPlayersCount = function () {
	var count = 0;
	
	for(var i = 0; i < this.players.length; ++i) {
		if (this.players[i].isPlaying)
			 ++count;
	}

	return count;
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
	
	var index = this.players.indexOf(player);
	
	if (index == -1) {
		return null;
	}

	index = (index + 1) % this.players.length;
	
	while(!this.players[index].isPlaying && this.players[index] != player) {
		var index = (index + 1) % this.players.length;
	}
	
	// If got to the same player, he might not be playing as well.
	if (this.players[index].isPlaying) {
		return this.players[index];
	} else {
		return null;
	}
}

PlayersData.prototype.setIsPlaying = function (player, isPlaying) {
	
	if (player.isPlaying == !!isPlaying)
		return;

	player.isPlaying = !!isPlaying;
	
	this._eworld.trigger(GameplayEvents.Players.IS_PLAYING_CHANGED, player);
}
	
	
PlayersData.prototype.getRelation = function (player1, player2) {
	
	if (player1.teamId == player2.teamId && (player1.teamId != -1 || player1.playerId == player2.playerId)) {
		return PlayersData.Relation.Ally;
	}
	
	return PlayersData.Relation.Enemy;
}

PlayersData.prototype.onDeserialize = function (eworld) {
	
	this._eworld = eworld;
	
	this._eworld.trigger(GameplayEvents.Players.PLAYERS_CLEARED);
}

Serialization.registerClass(PlayersData, 'PlayersData');

PlayersData.Relation = {
		Enemy: 0,
		Neutral: 0,
		Ally: 0,
	}
Enums.enumerate(PlayersData.Relation);

// This class is read-only data.
var Player = function (id, name, type, race, colorHue, teamId) {
	this.playerId = id;
	this.name = name;
	this.race = race;
	this.colorHue = colorHue;
	this.teamId = teamId;
	this.type = type;
	this.isPlaying = true;
	
};

Serialization.registerClass(Player, 'Player');

Player.Types = {
		Human: 0,
		AI: 0,
}

Player.Races = {
	Developers: 0,
	Empire: 0,
	Roaches: 0,
	JunkPeople: 0,
}

Enums.enumerate(Player.Types);
Enums.enumerate(Player.Races);
