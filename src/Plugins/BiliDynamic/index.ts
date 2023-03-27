import req from "../../Requester";
import BiliSubscriber from "../BiliSubscriber";
import log from "../../Logger";
import DBHandler from "../../DBHandler";
import qq from "../../QQMessage";
import { BiliDynamicType } from "./type";

class BiliDynamicSubscriber extends BiliSubscriber {
    tableName = "bili_dynamic";
    actionName = "动态";
    flagCol = "latest_dynamic_id";
    interval: NodeJS.Timeout | undefined;
    constructor() {
        super();
        this.addSub = this.addSub.bind(this);
        this.removeSub = this.removeSub.bind(this);
        this.sampleRec = this.sampleRec.bind(this);
    }

    async getLatestInfo(
        uid: number
    ): Promise<BiliDynamicType.dynamicInfo | undefined> {
        const { data: result } = await req.get({
            url: "https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history",
            params: {
                host_uid: uid,
            },
        });
        if (!(result && result.data)) {
            log.warn(`获取${uid}动态失败`);
            throw new Error("没有响应值，可能用户账号注销");
        }
        const cards = result.data.cards;
        if (!(cards && cards[0])) {
            log.warn(`获取${uid}的动态没有数据`);
            throw new Error("没有获取到数据，可能用户账号注销");
        }
        return {
            dynamic_id: BigInt(cards[0].desc.dynamic_id_str),
            timestamp: cards[0].desc.timestamp,
            card: cards[0].card,
        };
    }

    private parseDynamicCardToString(
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
        } catch (ex: any) {
            log.warn(ex.message ? ex.message : ex);
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
            return `转发了动态 评论：${comment}\n 原动态：${this.parseDynamicCardToString(
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

    public run() {
        setInterval(async () => {
            const rec = await this.sampleRec<BiliDynamicType.dynamicRec>();
            let info: BiliDynamicType.dynamicInfo;
            if (rec == null) {
                return;
            }
            try {
                info = (await this.getLatestInfo(
                    rec.uid
                )) as BiliDynamicType.dynamicInfo;
            } catch (error: any) {
                if (error) {
                    log.warn(error.message ? error.message : error);
                    return;
                }
                log.error("没有捕获到异常");
                return;
            }

            if (!info) {
                log.warn("获取最新动态失败");
                return;
            }

            if (rec.latest_dynamic_id == info.dynamic_id) {
                // log.debug(rec.uid, "最新动态没有变化");
                return;
            } else if (rec.ctime > info.timestamp) {
                log.info(rec.uid, "删除了动态");
                return;
            } else {
                try {
                    const data = await DBHandler.updateBiliSubscriberHitCount(
                        this.tableName,
                        this.flagCol,
                        info.timestamp,
                        info.dynamic_id,
                        rec.uid
                    );
                    log.debug(data);
                    const recs =
                        await DBHandler.getBiliRec<BiliDynamicType.dynamicRec>(
                            this.tableName,
                            rec.uid,
                            info.dynamic_id
                        );
                    recs.forEach((dynamic) => {
                        qq.sendToGroup(
                            dynamic.group_id,
                            `https://t.bilibili.com/${info.dynamic_id}\n[${
                                dynamic.name
                            }]${this.parseDynamicCardToString(info.card)}`
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
                        info.dynamic_id
                    );
                } catch (e: any) {
                    log.warn(e.message ? e.message : e);
                }
            }
        }, 8000);
    }
}

const biliDynamicSubscriber = new BiliDynamicSubscriber();

export default biliDynamicSubscriber;
