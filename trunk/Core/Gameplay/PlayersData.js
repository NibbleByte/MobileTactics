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
		
		++m_playingPlayersCount;
		
		m_eworld.trigger(PlayersData.Events.PLAYER_ADDED, player);
		
		return player;
	}
	
	this.clearPlayers = function () {
		m_players = [];
		m_playingPlayersCount = 0;
		
		m_eworld.trigger(PlayersData.Events.PLAYER_CLEARED);
	}
	
	this.getPlayers = function () {
		return m_players;
	}
	
	this.getPlayer = function (id) {
		return m_players[id];
	}
	
	this.setPlayers = function (players) {
		self.clearPlayers();
		
		m_players = players;
		
		for(var playerId in players) {
			if (players[playerId].isPlaying)
				++m_playingPlayersCount;
			
			m_eworld.trigger(PlayersData.Events.PLAYER_ADDED, players[playerId]);
		}
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
	
	
	this.getRelation = function (player1Id, player2Id) {
		var player1 = self.getPlayer(player1Id);
		var player2 = self.getPlayer(player2Id);
		
		if (player1.teamId == player2.teamId && (player1.teamId != -1 || player1.id == player2.id)) {
			return PlayersData.Relation.Ally;
		}
		
		return PlayersData.Relation.Enemy;
	}
};

PlayersData.BLACKBOARD_NAME = 'PlayersData';

PlayersData.Relation = {
		Enemy: 0,
		Neutral: 0,
		Ally: 0,
	}
Enums.enumerate(PlayersData.Relation);



PlayersData.Events = {
	PLAYER_ADDED: "players_data.player_added",		// Arguments: event, player
	PLAYER_CLEARED: "players_data.player_cleared",	// Arguments: event, player
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
