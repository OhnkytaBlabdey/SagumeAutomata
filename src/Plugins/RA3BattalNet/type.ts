export interface ServerBasicInfo {
	onlinePlayerCount: number;
	gameRoomCount: number;
}

export interface ServerDetailedInfo {
	count1v1: number;
	count2v2: number;
	countArchon: number;
	countPve: number;
	countOpenStaging: number;
}

export interface Status {
	losses: number;
	rank: number;
	elo: number; // 积分
	primaryFaction: string;
	wins: number;
	updateTime: string;
}

export interface PersonalStatus {
	ladder1v1?: Status;
	ladder2v2?: Status;
	ladder3v3?: Status;
	personaName: string;
}

export interface FactionWinningRate {
	wins: number;
	losses: number;
	total: number;
}

export interface OriginalFactionWinningRate {
	Allied: FactionWinningRate;
	Empire: FactionWinningRate;
	Soviet: FactionWinningRate;
}

export interface CoronaFactionWinningRate extends OriginalFactionWinningRate{
	Celestial: FactionWinningRate;
}
