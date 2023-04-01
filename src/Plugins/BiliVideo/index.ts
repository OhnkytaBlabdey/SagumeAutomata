import BiliSubscriber from "../BiliSubscriber";
import req from "../../Requester";
import log from "../../Logger";
import DBHandler from "../../DBHandler";
import qq from "../../QQMessage";
import { BiliVideoType } from "./type";

class VideoSubscriber extends BiliSubscriber {
    tableName = "bili_video";
    actionName = "视频";
    flagCol = "latest_av";
    interval: NodeJS.Timeout | undefined;
    constructor() {
        super();
    }

    async getLatestInfo(
        uid: number
    ): Promise<BiliVideoType.videoInfo | undefined> {
        try {
            const { data: result } = await req.get({
                url: "https://api.bilibili.com/x/space/arc/search",
                params: {
                    mid: uid,
                    ps: 1,
                },
            });
            if (result && result.data) {
                const jsonData = result;
                if (jsonData.data) {
                    const data = jsonData.data;
                    if (data.list && data.list.vlist) {
                        const item = data.list.vlist[0];
                        if (!item) {
                            log.warn("获取最新视频失败");
                        }
                        return {
                            av: item.aid,
                            cover: item.pic,
                            desc: item.description,
                            length: item.length,
                            pubdate: new Date(
                                item.created * 1000
                            ).toLocaleDateString("zh-cn"),
                            title: item.title,
                            timestamp: item.created,
                        };
                    }
                    log.warn(data, "格式错误");
                }
            } else {
                log.warn(result.data, "视频返回格式错误");
            }
        } catch (e: any) {
            log.warn((<Error>e).message ? (<Error>e).message : e);
        }
    }

    async runHandler() {
        const rec = await this.sampleRec<BiliVideoType.videoRec>();
        let info: BiliVideoType.videoInfo;
        if (rec == null) {
            return;
        }
        try {
            info = (await this.getLatestInfo(
                rec.uid
            )) as BiliVideoType.videoInfo;
        } catch (error: any) {
            log.warn(error.message ? error.message : error);
            return;
        }
        if (!info) {
            log.info("获取最新视频失败");
            return;
        }
        if (rec.latest_av == info.av) {
            // log.debug(rec.uid, "最新视频没有变化");
            return;
        } else if (rec.ctime > info.timestamp) {
            log.info(rec.uid, "删除了视频");
            return;
        } else {
            try {
                const data = await DBHandler.updateBiliSubscriberHitCount(
                    this.tableName,
                    this.flagCol,
                    info.timestamp,
                    info.av,
                    rec.uid
                );
                log.debug(data);
                const recs =
                    await DBHandler.getBiliRec<BiliVideoType.videoRec>(
                        this.tableName,
                        rec.uid,
                        info.av
                    );
                log.info("视频更新", info.title);
                recs.forEach((av) => {
                    qq.sendToGroup(
                        av.group_id,
                        `${av.name} 更了. ${info.title}\nb23.tv/av${av.latest_av}\n[CQ:image,file=${info.cover}]\n` +
                        `发布 ${info.pubdate} 时长【${info.length}】\n` +
                        `简介：${info.desc} ${
                            info.desc.length > 200 ? " ..." : " "
                        }`
                    );
                });
            } catch (e: any) {
                log.warn(e.message ? e.message : e);
                return;
            }
            try {
                await DBHandler.updateSubscribeStatus(
                    this.tableName,
                    rec.uid,
                    info.av
                );
            } catch (e: any) {
                log.warn(e.message ? e.message : e);
                return;
            }
        }
    }

    public run() {
        setTimeout(() => {
            this.runHandler().finally(() => {
                this.run();
            });
        }, 8000);
    }
}

const biliVideoSubscriber = new VideoSubscriber();

export default biliVideoSubscriber;
