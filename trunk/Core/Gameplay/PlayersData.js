//===============================================
// PlayersData
// Holds players data.
//===============================================
"use strict";

var PlayersData = function (m_eworld) {
	
	var self = this;
	
	var m_players = [];
	var m_playingPlayersCount = 0;
	
	this.addPlayer = function (name, type, teamId) {
		
		var player = new Player(m_players.length, name, type, teamId || -1);
		m_players.push(player);
		
		m_eworld.trigger(PlayersData.Events.PLAYER_ADDED, player);
		
		++m_playingPlayersCount;
		
		return player;
	}
	
	this.getPlayers = function () {
		return m_players;
	}
	
	this.getPlayer = function (id) {
		return m_players[id];
	}
	
	this.setPlayers = function (players) {
		m_playingPlayersCount = 0;
		
		for(var playerId in players) {
			if (players[playerId].isPlaying)
				++m_playingPlayersCount;
		}
		
		m_players = players;
	}
		
	this.getPlayingPlayersCount = function () {
		return m_playingPlayersCount;
	}
	
	this.getFirstPlayingPlayer = function () {
		
		if (m_players[0].isPlaying)
			return m_players[0];
		
		return self.getNextPlayer(m_players[0]);
	}
	
	this.getNextPlayingPlayer = function (player) {
		var id = player.id;
		
		var nextId = (id + 1) % m_players.length;
		
		while(!m_players[nextId].isPlaying && id != nextId) {
			var nextId = (nextId + 1) % m_players.length;
		}
		
		return m_players[nextId];
	}
	
	this.stopPlaying = function (player) {
		console.assert(player.isPlaying, 'Player have already stopped playing.');
		
		player.isPlaying = false;
		
		--m_playingPlayersCount;
		
		m_eworld.trigger(PlayersData.Events.PLAYER_STOPPED_PLAYING, player);
	}
};

PlayersData.BLACKBOARD_NAME = 'PlayersData';



PlayersData.Events = {
	PLAYER_ADDED: "players_data.player_added",	// Arguments: event, player
	PLAYER_STOPPED_PLAYING: "players_data.player_stopped",	// Arguments: event, player
	PLAYER_REMOVED: "players_data.player_removed",	// Arguments: event, player
}


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