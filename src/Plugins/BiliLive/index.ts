import BiliSubscriber from "../BiliSubscriber";
import req from "../../Requester";
import log from "../../Logger";
import dbHandler from "../../DBHandler";
import qq from "../../QQMessage";
import { BiliLiveType } from "./type";
import configHandler from "../../ConfigHandler";
import { time } from "console";
import { random } from "lodash";

class BiliLiveSubscriber extends BiliSubscriber {
	tableName = "bili_live";
	actionName = "直播";
	flagCol = "liveStatus";
	interval: NodeJS.Timeout | undefined;
	private statusMap = ["下播", "播了", "进入轮播"];

	constructor() {
		super();
		this.addSub = this.addSub.bind(this);
		this.removeSub = this.removeSub.bind(this);
		this.sampleRec = this.sampleRec.bind(this);
	}

	async getLatestInfo(uid: number): Promise<BiliLiveType.liveInfo | undefined> {
		let { data: res } = await req.get(
			{
				url: "https://api.bilibili.com/x/space/wbi/acc/info",
				params: {
					mid: uid,
					// token:,
					// platform: "web",
					// web_location: 1919810,
					// w_rid: "1234567890abcdef1234567890abcdef",
					// wts: new Date().getTime(),
				},
			}
			// {
			// 	headers: {
			// 		cookie: configHandler.getGlobalConfig().cookie,
			// 	},
			// }
		);
		// 针对阴间响应的解析
		if (!(res && res.data)) {
			const t = this.parseResponse(res);
			res = t.length > 0 ? t[0] : res;
		}
		if (res && res.data) {
			const data = res.data; // resp root.data
			if (data) {
				const liveRoom = data.live_room;
				if (!liveRoom) {
					log.warn(`获取${uid}直播间状态失败`);
					// 被反爬
					// {
					//   ga_data: {
					//     decisions: [ 'verify_captcha_level2' ],
					//     risk_level: 1,
					//     grisk_id: '1234567890abcdef1234567890abcdef',
					//     decision_ctx: {
					//       buvid: '12345678-90ab-cdef-1234567890abcdef0infoc',
					//       decision_type: '4',
					//       ip: '1234.5678.90ab.cdef',
					//       mid: '0',
					//       origin_scene: 'anti_crawler',
					//       scene: 'crawler_main_space_wbi_acc_info',
					//       ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
					//       v_voucher: 'voucher_12345678-90ab-cdef'
					//     }
					//   }
					// }
					return;
				}
				return {
					cover: liveRoom.cover,
					liveStatus: liveRoom.liveStatus,
					url: (liveRoom.url as string).split("?")[0],
					online: liveRoom.online || liveRoom.watched_show.num,
					title: liveRoom.title,
					timestamp: -1,
				};
			} else {
				log.warn("直播间返回格式错误", JSON.stringify(data));
			}
		}
	}

	private __generateLiveStatusInfo(
		live: BiliLiveType.liveRec,
		info: BiliLiveType.liveInfo
	): string {
		return (
			`${live.name} ${
				info.liveStatus < 3 ? this.statusMap[info.liveStatus] : "未知状态"
			}\n${info.url}\n[CQ:image,file=${info.cover}]\n` +
			`人气 ${info.online} 标题【${info.title}】\n https://space.bilibili.com/${live.uid}`
		);
	}

	private async __broadcastLiveStatusInfo(
		rec: BiliLiveType.liveRec,
		info: BiliLiveType.liveInfo
	) {
		const recs = await dbHandler.getBiliRec<BiliLiveType.liveRec>(
			this.tableName,
			rec.uid,
			info.liveStatus
		);
		recs.forEach((live: BiliLiveType.liveRec) => {
			qq.sendToGroupSync(live.group_id, [
				this.__generateLiveStatusInfo(live, info),
			]);
		});
	}

	async runHandler() {
		const rec = await this.sampleRec<BiliLiveType.liveRec>();
		if (rec) {
			let info: BiliLiveType.liveInfo;
			try {
				info = (await this.getLatestInfo(rec.uid)) as BiliLiveType.liveInfo;
			} catch (error: any) {
				// log.warn(error);
				log.warn(error.message ? error.message : error);
				return;
			}
			if (!info) {
				log.info("获取直播间状态失败");
				return;
			}
			if (rec.liveStatus == info.liveStatus) {
				// log.debug(rec.uid, "直播间状态没有变化");
				return;
			} else {
				if (info.liveStatus == 1) {
					try {
						// 命中次数增加
						const data = await dbHandler.updateBiliSubscriberHitCount(
							this.tableName,
							this.flagCol,
							info.timestamp ? info.timestamp : -1,
							info.liveStatus,
							rec.uid,
							true
						);
						log.debug(data);
					} catch (e: any) {
						log.error(e.message ? e.message : e);
						return;
					}
				} else {
					try {
						const data = await dbHandler.updateBiliLiveStatus(
							this.tableName,
							rec.uid,
							info.liveStatus
						);
						log.debug(data);
					} catch (e: any) {
						log.warn(e.message ? e.message : e);
						return;
					}
				}
				try {
					await this.__broadcastLiveStatusInfo(rec, info);
				} catch (e: any) {
					log.warn(e.message ? e.message : e);
					return;
				}
				try {
					await dbHandler.updateSubscribeStatus(
						this.tableName,
						rec.uid,
						info.liveStatus
					);
				} catch (e: any) {
					log.warn(e.message ? e.message : e);
				}
			}
		}
	}

	public run() {
		// TODO: 合法登录，否则会被反爬
		setTimeout(async () => {
			this.runHandler().finally(() => {
				this.run();
			});
		}, 60000);
	}
}

const subscriber = new BiliLiveSubscriber();

export default subscriber;
