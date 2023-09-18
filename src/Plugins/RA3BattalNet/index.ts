import Requester from "../../Requester";
import {
	CoronaFactionWinningRate,
	OriginalFactionWinningRate,
	PersonalStatus,
	ServerBasicInfo,
	ServerDetailedInfo
} from "./type";
const API = {
	"SERVER_BASIC_INFO": "https://api.ra3battle.cn/api/server/status/basic",
	"SERVER_DETAILED_INFO": "https://api.ra3battle.cn/api/server/status/detail",
	"ORIGINAL_PERSONAL_STATUS": (id: number) => `https://api.ra3battle.cn/api/stats/persona/${id}/ra3/result`,
	"CORONA_PERSONAL_STATUS": (id: number) => `https://api.ra3battle.cn/api/stats/persona/${id}/corona/result`,
	"ORIGINAL_FACTION_WINNING_RATE": "https://api.ra3battle.cn/api/stats/1v1/factions/ra3/1",
	"CORONA_FACTION_WINNING_RATE": "https://api.ra3battle.cn/api/stats/1v1/factions/corona/1"
}
const STATUS = {
	CLOSED_PLAYING: "closedplaying",
	OPEN_STAGING: "openstaging"
}

class RA3BattalNet {
	async getServerBasicInfo() {
		const {data} = await Requester.get({
			url: API.SERVER_BASIC_INFO
		});
		return data as ServerBasicInfo;
	}

	async getServerDetailedInfo() {
		const {data} = await Requester.get({
			url: API.SERVER_DETAILED_INFO
		});
		const countOpenStaging = (data.games as Array<any>).filter(i => {
			return i.gamemode === STATUS.OPEN_STAGING;
		});
		return {
			countOpenStaging: countOpenStaging.length,
			count1v1: data.automatching.count1v1,
			count2v2: data.automatching.count2v2,
			countArchon: data.automatching.countArchon,
			countPve: data.automatching.countPve
		} as ServerDetailedInfo;
	}

	async getOriginalPersonalStatus(id: number) {
		try {
			const {data} = await Requester.get({
				url: API.ORIGINAL_PERSONAL_STATUS(id)
			});
			const info: PersonalStatus = {
				personaName: data.personaName
			};
			if(Object.prototype.hasOwnProperty.call(data, "ladder1v1") && data.ladder1v1) {
				info["ladder1v1"] = {
					losses: data.ladder1v1.losses,
					wins: data.ladder1v1.wins,
					elo: data.ladder1v1.elo,
					updateTime: new Date(data.ladder1v1.updateTime).toLocaleString(),
					rank: data.ladder1v1.rank,
					primaryFaction: data.ladder1v1.primaryFaction
				}
			}
			if(Object.prototype.hasOwnProperty.call(data, "ladder2v2") && data.ladder2v2) {
				info["ladder2v2"] = {
					losses: data.ladder2v2.losses,
					wins: data.ladder2v2.wins,
					elo: data.ladder2v2.elo,
					updateTime: new Date(data.ladder2v2.updateTime).toLocaleString(),
					rank: data.ladder2v2.rank,
					primaryFaction: data.ladder2v2.primaryFaction
				}
			}
			if(Object.prototype.hasOwnProperty.call(data, "ladder3v3") && data.ladder3v3) {
				info["ladder3v3"] = {
					losses: data.ladder3v3.losses,
					wins: data.ladder3v3.wins,
					elo: data.ladder3v3.elo,
					updateTime: new Date(data.ladder3v3.updateTime).toLocaleString(),
					rank: data.ladder3v3.rank,
					primaryFaction: data.ladder3v3.primaryFaction
				}
			}
			return info;
		} catch (e) {
			console.log(e);
			return false;
		}
	}

	async getCoronaPersonalStatus(id: number) {
		try {
			const {data} = await Requester.get({
				url: API.CORONA_PERSONAL_STATUS(id)
			});
			const info: PersonalStatus = {
				personaName: data.personaName
			};
			if(Object.prototype.hasOwnProperty.call(data, "ladder1v1") && data.ladder1v1) {
				info["ladder1v1"] = {
					losses: data.ladder1v1.losses,
					wins: data.ladder1v1.wins,
					elo: data.ladder1v1.elo,
					updateTime: new Date(data.ladder1v1.updateTime).toLocaleString(),
					rank: data.ladder1v1.rank,
					primaryFaction: data.ladder1v1.primaryFaction
				}
			}
			if(Object.prototype.hasOwnProperty.call(data, "ladder2v2") && data.ladder2v2) {
				info["ladder2v2"] = {
					losses: data.ladder2v2.losses,
					wins: data.ladder2v2.wins,
					elo: data.ladder2v2.elo,
					updateTime: new Date(data.ladder2v2.updateTime).toLocaleString(),
					rank: data.ladder2v2.rank,
					primaryFaction: data.ladder2v2.primaryFaction
				}
			}
			if(Object.prototype.hasOwnProperty.call(data, "ladder3v3") && data.ladder3v3) {
				info["ladder3v3"] = {
					losses: data.ladder3v3.losses,
					wins: data.ladder3v3.wins,
					elo: data.ladder3v3.elo,
					updateTime: new Date(data.ladder3v3.updateTime).toLocaleString(),
					rank: data.ladder3v3.rank,
					primaryFaction: data.ladder3v3.primaryFaction
				}
			}
			return info;
		} catch (e) {
			console.log(e);
			return false;
		}
	}

	async getOriginalFactionWinningRate() {
		const {data} = await Requester.get({
			url: API.ORIGINAL_FACTION_WINNING_RATE
		});
		return data as OriginalFactionWinningRate;
	}

	async getCoronaFactionWinningRate() {
		const {data} = await Requester.get({
			url: API.CORONA_FACTION_WINNING_RATE
		});
		return data as CoronaFactionWinningRate;
	}
}

const battalNet = new RA3BattalNet();

export default battalNet;