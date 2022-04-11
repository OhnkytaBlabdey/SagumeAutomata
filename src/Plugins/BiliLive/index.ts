import BiliSubscriber from "../BiliSubscriber";
import req from "../../Requester";
import log from "../../Logger";
import dbHandler from "../../DBHandler";
import qq from "../../QQMessage";
import {BiliLiveType} from "./type";

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
        try {
            const {data} = await req.get({
                url: "https://api.bilibili.com/x/space/acc/info",
                params: {
                    mid: uid,
                },
            });
            if (data && data.data) {
                const jsonData = data.data;
                if (jsonData) {
                    const data = jsonData.live_room;
                    if (!data) {
                        log.warn("获取直播间状态失败");
                    }
                    return {
                        cover: data.cover,
                        liveStatus: data.liveStatus,
                        url: data.url,
                        online: data.online || data.watched_show.num,
                        title: data.title,
                        timestamp: -1
                    };
                } else {
                    log.warn("直播间返回格式错误", JSON.stringify(jsonData));
                }
            }
        } catch (e) {
            throw e;
        }
    }

    private __generateLiveStatusInfo(live: BiliLiveType.liveRec, info: BiliLiveType.liveInfo): string {
        return `${live.name} ${info.liveStatus < 3 ? this.statusMap[info.liveStatus] : "未知状态"}\n${info.url}\n[CQ:image,file=${info.cover}]\n` +
            `人气 ${info.online} 标题【${info.title}】\n https://space.bilibili.com/${live.uid}`;
    }

    private async __broadcastLiveStatusInfo(rec: BiliLiveType.liveRec, info: BiliLiveType.liveInfo) {
        let recs = await dbHandler.getBiliRec<BiliLiveType.liveRec>(this.tableName, rec.uid, info.liveStatus);
        recs.forEach((live: BiliLiveType.liveRec) => {
            qq.sendToGroup(
                live.group_id,
                this.__generateLiveStatusInfo(live, info)
            );
        });
    }

    public run() {
        setInterval(async () => {
            const rec = await this.sampleRec<BiliLiveType.liveRec>();
            if (rec) {
                let info: BiliLiveType.liveInfo;
                try {
                    info = await this.getLatestInfo(rec.uid) as BiliLiveType.liveInfo;
                } catch (error) {
                    log.warn(error.errMessage ? error.errMessage : error);
                    return;
                }
                if (!info) {
                    log.info("获取直播间状态失败");
                    return;
                }
                if (rec.liveStatus == info.liveStatus) {
                    log.debug(rec.uid, "直播间状态没有变化");
                    return;
                } else {
                    if (info.liveStatus == 1) {
                        try {
                            // 命中次数增加
                            const data = await dbHandler.updateBiliSubscriberHitCount(this.tableName, this.flagCol, info.timestamp ? info.timestamp : -1, info.liveStatus, rec.uid, true);
                            log.info(data);
                        } catch (e) {
                            log.error(e.message ? e.message : e);
                            return;
                        }
                    } else {
                        try {
                            const data = await dbHandler.updateBiliLiveStatus(this.tableName, rec.uid, info.liveStatus);
                            log.info(data);
                        } catch (e) {
                            log.warn(e.message ? e.message : e);
                            return;
                        }
                    }
                    try {
                        await this.__broadcastLiveStatusInfo(rec, info);
                    } catch (e) {
                        log.warn(e.message ? e.message : e);
                        return;
                    }
                    try {
                        await dbHandler.updateSubscribeStatus(this.tableName, rec.uid, info.liveStatus);
                    } catch (e) {
                        log.warn(e.message ? e.message : e);
                    }
                }
            }
        }, 6000);
    }
}

const subscriber = new BiliLiveSubscriber();

export default subscriber;
