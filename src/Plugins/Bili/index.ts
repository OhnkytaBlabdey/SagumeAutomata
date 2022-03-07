import {BasicPlugin} from "../BasicPlugin";
import {Cmd} from "../../QQCommand/cmd.interface";
import {Bili, validateBiliDynamic, validateBiliLive, validateBiliVideo} from "../Checker";
import req from "../../Requester";
import log from "../../Logger";
import {BiliPlugin} from "./interface";
import {RequesterResponseType} from "../../Requester/interface";
import {sampleRec} from "../../Util/sampleRec";
import dbHandler from "../../DBHandler";
import {DB} from "../../DBHandler/interface";
import {DBText} from "../../Util/Text";
import QQMessage from "../../QQMessage";

enum BiliAPI {
    VIDEO = "https://api.bilibili.com/x/space/arc/search",
    DYNAMIC = "https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history",
    LIVE_ROOM = "https://api.bilibili.com/x/space/acc/info"
}

enum BiliTables {
    VIDEO = "bili_video",
    LIVE = "bili_live",
    DYNAMIC = "bili_dynamic"
}

enum BiliFlagCol {
    VIDEO = "latest_av",
    LIVE = "liveStatus",
    DYNAMIC = "latest_dynamic_id"
}

class BiliBiliPlugin extends BasicPlugin {
    protected cmdList: Cmd[];

    constructor() {
        super();
        this.cmdList = [];
    }

    private async getLatestInfo(uid: number, url: string, params: any, validateHandler: Bili.validateHandler): Promise<BiliPlugin.GetLatestInfoReturnType> {
        try {
            let result = await req.get({
                url,
                params
            });
            let flag = validateHandler(result, uid);
            if (flag.res === Bili.StatusCode.PASS) {
                return {
                    status: 1,
                    data: result
                };
            }
            log.warn(flag.info);
            return {
                status: 0,
                error: new Error(flag.info)
            };
        } catch (e) {
            log.error("叔叔我啊，可是会生气的哦");
            log.error(e);
            return {
                status: 0,
                error: e
            };
        }
    }

    public async getLatestVideo(uid: number): Promise<BiliPlugin.VideoInfoReturnType> {
        let res = await this.getLatestInfo(uid, BiliAPI.VIDEO, {mid: uid, ps: 1}, validateBiliVideo);
        if (res.status) {
            let result = res.data as RequesterResponseType;
            let item = result.data.data.list.vlist[0];
            return {
                status: 1,
                data: {
                    av: item.aid, //number
                    cover: item.pic, //string
                    desc: item.description, //string
                    length: item.length, //string
                    pubdate: new Date(item.created * 1000).toLocaleDateString("zh-cn"),
                    title: item.title, //string
                    timestamp: item.created,
                }
            };
        }
        return {
            status: 0,
            error: res.error
        };
    }

    public async getLatestDynamic(uid: number): Promise<BiliPlugin.DynamicInfoReturnType> {
        let res = await this.getLatestInfo(uid, BiliAPI.DYNAMIC, {host_uid: uid}, validateBiliDynamic);
        if (res.status) {
            let result = res.data as RequesterResponseType;
            const cards = result.data.data.cards;
            return {
                status: 1,
                data: {
                    dynamic_id: BigInt(cards[0].desc.dynamic_id_str),
                    timestamp: cards[0].desc.timestamp,
                    card: cards[0].card
                }
            };
        }
        return {
            status: 0,
            error: res.error
        };
    }

    public async getLiveRoomStatus(uid: number): Promise<BiliPlugin.LiveRoomInfoReturnType> {
        let res = await this.getLatestInfo(uid, BiliAPI.LIVE_ROOM, {mid: uid}, validateBiliLive);
        if (res.status) {
            let result = res.data as RequesterResponseType;
            const data = result.data.data.live_room;
            return {
                status: 1,
                data: {
                    cover: data.cover,
                    liveStatus: data.liveStatus,
                    url: data.url,
                    online: data.online,
                    title: data.title,
                    timestamp: 0
                }
            };
        }
        return {
            status: 0,
            error: res.error
        };
    }

    private operateHitCount(tableName: string, kvs: DB.UpdatePairType[], conditions: string[]) {
        return dbHandler.update(
            tableName,
            [
                {k: "hit_count", v: "hit_count+1",},
                ...kvs
            ],
            [
                ...conditions
            ]
        );
    }

    private operateSelection(tableName: string, conditions: string[], all: boolean, uid: number) {
        return dbHandler.select(
            [tableName],
            ["*"],
            [`uid=${uid}`, ...conditions],
            all
        );
    }

    private parseDynamicCardtoString(
        cardStr: string,
        item: any = null
    ): string {
        if (!cardStr) {
            log.warn(cardStr, "没有内容");
            return "解析失败";
        }
        let card = null;
        try {
            card = JSON.parse(cardStr);
        } catch (ex) {
            log.warn(ex);
            return "解析失败";
        }
        if (card.aid) {
            // 视频
            const picUrl = card.pic;
            const desc = card.desc;
            const av = card.aid;
            const videoText = `简介：${desc}\n链接：b23.tv/av${av}\n封面：[CQ:image,file=${picUrl}]`;
            // if (card.up_from_v2) {
            // TODO 投稿视频（？）
            return (
                "发了视频 " +
                `${card.dynamic ? card.dynamic + "\n" : ""} ` +
                videoText
            );
        } else if (card.origin) {
            // TODO 转发动态（？）
            // origin.item
            const comment = card.item.content;
            // 投票详情在JSON.parse(card.origin_extension)中
            return `转发了动态 评论：${comment}\n 原动态：${this.parseDynamicCardtoString(
                card.origin,
                card.item
            )}`;
        } else {
            // TODO 原创动态
            const itm = card.item || item;
            if (!itm) {
                //专栏头图
                if (card.banner_url || card.image_urls) {
                    const title: string = card.title;
                    const summary: string = card.summary;
                    const pic: string = card.banner_url || card.image_urls[0];
                    return `发了专栏${title}\n简介：${summary}\n[CQ:image,file=${pic}]`;
                }
                log.warn("无法解析");
                return "无法解析的格式";
            }
            if (itm.pictures) {
                // 原创图片
                const desc: string = itm.description;
                const picCount: number = itm.pictures_count;
                const pictures: any[] = itm.pictures;
                let dynamicStr = "发布了动态 " + desc;
                if (picCount > 0) {
                    const picCQs = pictures
                        .map((pic) => {
                            return `[CQ:image,file=${pic.img_src}]`;
                        })
                        .reduce((prev, cur) => prev + "\n" + cur);
                    dynamicStr += picCQs;
                }
                return dynamicStr;
            } else {
                // 原创文本
                // card.origin_image_urls 预览图列表
                if (card.summary) {
                    let dynamicStr = `发布了专栏 ${card.title}\n`;
                    if (
                        card.origin_image_urls &&
                        card.origin_image_urls.length
                    ) {
                        const urls: any[] = card.origin_image_urls;
                        const picCQs = urls
                            .map((pic) => {
                                return `[CQ:image,file=${pic.img_src}]`;
                            })
                            .reduce((prev, cur) => prev + "\n" + cur);
                        dynamicStr += picCQs;
                    }
                    return dynamicStr;
                }
                return `发布了动态 ${itm.content || "[无法解析的格式]"}`;
            }
        }
    }

    public async videoIntervalTask(): Promise<void> {
        const rec = (await sampleRec(BiliTables.VIDEO)) as BiliPlugin.VideoRec;
        if (rec === null) {
            return;
        }
        const videoInfo = await this.getLatestVideo(rec.uid);
        if (!videoInfo.status) {
            log.info(videoInfo.error?.message);
            log.info("获取最新视频失败");
            return;
        }
        const info = videoInfo.data as BiliPlugin.Video;
        if (rec.latest_av === info.av) {
            log.debug(rec.uid, "最新视频没有变化");
        } else if (rec.ctime > info.timestamp) {
            log.info(rec.uid, "删除了视频");
        } else {
            this.operateHitCount(
                BiliTables.VIDEO,
                [{k: "ctime", v: info.timestamp,}, {k: BiliFlagCol.VIDEO, v: info.av,}],
                [`uid=${DBText(rec.uid.toString())}`, `${BiliFlagCol.VIDEO}!=${info.av}`,]
            ).then(async (res) => {
                log.info(res);
                const recs: BiliPlugin.VideoRec[] = await this.operateSelection(
                    BiliTables.VIDEO,
                    [
                        `before_update!=${info.av}`
                    ],
                    true,
                    rec.uid
                );
                log.info("视频更新", info.title);
                recs.forEach((av: BiliPlugin.VideoRec) => {
                    QQMessage.sendToGroup(
                        av.group_id,
                        `${av.name} 更了. ${info.title}\nb23.tv/av${av.latest_av}\n[CQ:image,file=${info.cover}]\n` +
                        `发布 ${info.pubdate} 时长【${info.length}】\n` +
                        `简介：${info.desc} ${
                            info.desc.length > 200 ? " ..." : " "
                        }`
                    );
                });
                dbHandler.update(BiliTables.VIDEO, [{
                    k: "before_update",
                    v: info.av,
                },], [`uid=${rec.uid}`, `before_update!=${info.av}`])
                    .catch((e) => {
                        if (e) {
                            log.warn(e);
                        }
                    });
            });
        }
        return;
    }

    public async liveIntervalTask() {
        const rec = (await sampleRec(BiliTables.LIVE)) as BiliPlugin.LiveRec;
        if (rec === null) {
            return;
        }
        let d = await this.getLiveRoomStatus(rec.uid);
        if (!d.status) {
            log.warn(d.error?.message);
            log.info("获取直播间状态失败");
            return;
        }
        let info = d.data;
        const selectLiveRecs = async () => {
            const recs: BiliPlugin.LiveRec[] = await this.operateSelection(
                BiliTables.LIVE,
                [`before_update!=${info?.liveStatus}`],
                true,
                rec.uid
            );
            return recs;
        };
        const updateBeforeUpdate = () => {
            return dbHandler
                .update(BiliTables.LIVE, [{
                    k: "before_update",
                    v: info?.liveStatus,
                }], [`uid=${rec.uid}`, `before_update!=${info?.liveStatus}`,])
                .catch((e) => {
                    if (e) {
                        log.warn(e);
                    }
                });
        };
        const updateLiveStatus = () => {
            return dbHandler.update(BiliTables.LIVE, [{
                k: "liveStatus",
                v: info?.liveStatus,
            }], [`uid=${rec.uid}`, `liveStatus!=${info?.liveStatus}`]);
        };
        const messageGenerator = (status: number, live: BiliPlugin.LiveRec, info: BiliPlugin.LiveInfo) => {
            switch (status) {
            case 1:
                return `${live.name} 播了 \n${info?.url}\n[CQ:image,file=${info?.cover}]\n` +
                    `人气 ${info?.online} 标题【${info?.title}】\n https://space.bilibili.com/${live.uid}`;
            case 0:
                return `${live.name} 下播了\n${info?.url}\n[CQ:image,file=${info?.cover}]\n` +
                    `人气 ${info?.online} 标题【${info?.title}】\n https://space.bilibili.com/${live.uid}`;
            case 2:
                return `${live.name} 进入轮播\n${info.url}\n[CQ:image,file=${info.cover}]\n` +
                    `人气 ${info.online} 标题【${info.title}】\n https://space.bilibili.com/${live.uid}`;
            default:
                return "";
            }
        };
        const broadcastMessage = async (status: number) => {
            const recs: BiliPlugin.LiveRec[] = await selectLiveRecs();
            recs.forEach((live: BiliPlugin.LiveRec) => {
                QQMessage.sendToGroup(
                    live.group_id,
                    messageGenerator(status, live, info as BiliPlugin.LiveInfo)
                );
            });
        };


        if (rec.liveStatus === info?.liveStatus) {
            log.debug(rec.uid, "直播间状态没有变化");
        } else if (info?.liveStatus === 1) {    // 开勃
            this.operateHitCount(
                BiliTables.LIVE,
                [{k: BiliFlagCol.LIVE, v: info.liveStatus}],
                [`uid=${rec.uid}`, `${BiliFlagCol.LIVE}!=${info.liveStatus}`]
            ).then(async (res) => {
                log.info(res);
                log.info("开播", rec.name);
                await broadcastMessage((info as BiliPlugin.LiveInfo).liveStatus);
                updateBeforeUpdate();
            });
        } else if (info?.liveStatus === 0 || info?.liveStatus === 2) {  // 勃还是不勃
            updateLiveStatus().then(async (res) => {
                log.info(res);
                await broadcastMessage((info as BiliPlugin.LiveInfo).liveStatus);
                updateBeforeUpdate();
            });
        }
    }

    public async dynamicsIntervalTask() {
        const rec = (await sampleRec(BiliTables.DYNAMIC)) as BiliPlugin.DynamicRec;
        if (rec === null) {
            return ;
        }
        let d = await this.getLatestDynamic(rec.uid);
        if (!d.status) {
            log.warn(d.error?.message);
            log.warn("获取最新动态失败");
            return ;
        }
        let info = d.data as BiliPlugin.DynamicInfo;
        if (rec.latest_dynamic_id === info.dynamic_id) {
            log.debug(rec.uid, "最新动态没有改变");
        } else if(rec.ctime > info.timestamp) {
            log.info(rec.uid, "删除了动态");
        } else {
            this.operateHitCount(
                BiliTables.DYNAMIC,
                [{k: "ctime", v: info.timestamp,}, {k: BiliFlagCol.DYNAMIC, v: info.dynamic_id,}],
                [`uid=${rec.uid}`, `${BiliFlagCol.DYNAMIC}!=${info.dynamic_id}`]
            ).then(async (res) => {
                log.info(res);
                const recs: BiliPlugin.DynamicRec[] = await dbHandler.select(
                    [BiliTables.DYNAMIC],
                    ["*"],
                    [
                        `uid=${rec.uid}`,
                        `before_update!=${info.dynamic_id}`,
                    ],
                    true
                );
                recs.forEach((dynamic: BiliPlugin.DynamicRec) => {
                    QQMessage.sendToGroup(
                        dynamic.group_id,
                        `https://t.bilibili.com/${info.dynamic_id}\n[${
                            dynamic.name
                        }]${this.parseDynamicCardtoString(info.card)}`
                    );
                });
                dbHandler.update(
                        BiliTables.DYNAMIC,
                        [
                            {
                                k: "before_update",
                                v: info.dynamic_id,
                            },
                        ],
                        [
                            `uid=${rec.uid}`,
                            `before_update!=${info.dynamic_id}`,
                        ]
                    )
                    .catch((e) => {
                        if (e) {
                            log.warn(e);
                        }
                    });
            });
        }
    }
    public init(): any {

    }
}
