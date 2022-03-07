import dbHandler from "../../../../DBHandler";
import req from "../../../../Requester";
import log from "../../../../Logger";
import QQMessage from "../../../../QQMessage";
import { dynamicInfo, dynamicRec } from "./dynamic.interface";
import { RequesterResponseType } from "../../../../Requester/interface";
import Subscriber from "../Subscriber";
/**
 * 订阅B站的动态
 */

/**
 * “理念是杀得死的。”她说着走进了气闭锁。
 * “如何？”
 * 闭锁转动着关上，密封也一样。SCP-3125闭嘴了。
 * 她对着没有人，独自说道：“用更好的理念。”
 *  								____ your last first day
 */

/**
 * 订阅动态
 */
class DynamicSubscriber extends Subscriber {
    private static __instance: DynamicSubscriber;
    tableName = "bili_dynamic";
    actionName = "动态";
    flagCol = "latest_dynamic_id";

    public static getInstance(): DynamicSubscriber {
        if (!this.__instance) {
            this.__instance = new DynamicSubscriber();
        }
        return this.__instance;
    }

    getLatestInfo(uid: number) {
        return new Promise<dynamicInfo>((res, rej) => {
            req.get({
                url: "https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history",
                params: {
                    // eslint-disable-next-line camelcase
                    host_uid: uid,
                },
            })
                .then((result: RequesterResponseType) => {
                    if (!(result && result.data && result.data.data)) {
                        log.warn(`获取${uid}动态失败`);
                        rej(new Error("没有响应值"));
                    }
                    const cards = result.data.data.cards;
                    if (!(cards && cards[0])) {
                        log.warn(`获取${uid}的动态没有数据`);
                        rej(new Error("没有获取到数据"));
                    }
                    res({
                        // eslint-disable-next-line camelcase
                        dynamic_id: BigInt(cards[0].desc.dynamic_id_str),
                        timestamp: cards[0].desc.timestamp,
                        card: cards[0].card,
                    } as dynamicInfo);
                })
                .catch((error) => {
                    if (error) {
                        rej(error);
                    }
                });
        });
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

    public run(): void {
        setInterval(async () => {
            const rec = (await this.sampleRec()) as dynamicRec;
            if (rec == null) {
                return;
            }
            let info: dynamicInfo;
            try {
                info = await this.getLatestInfo(rec.uid);
            } catch (error: any) {
                if (error) {
                    log.warn(error.errMessage ? error.errMessage : error);
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
                log.debug(rec.uid, "最新动态没有变化");
                return;
            } else if (rec.ctime > info.timestamp) {
                log.info(rec.uid, "删除了动态");
                return;
            } else {
                // 命中次数增加
                dbHandler.update(this.tableName, [{k: "hit_count", v: "hit_count+1",}, {k: "ctime", v: info.timestamp,}, {k: this.flagCol, v: info.dynamic_id,},], [`uid=${rec.uid}`, `${this.flagCol}!=${info.dynamic_id}`,])
                    .then(async (res) => {
                        log.info(res);
                        // log.info("通知更新");
                        const recs: dynamicRec[] = await dbHandler.select(
                            [this.tableName],
                            ["*"],
                            [
                                `uid=${rec.uid}`,
                                `before_update!=${info.dynamic_id}`,
                            ],
                            true
                        );
                        recs.forEach((dynamic: dynamicRec) => {
                            QQMessage.sendToGroup(
                                dynamic.group_id,
                                `https://t.bilibili.com/${info.dynamic_id}\n[${
                                    dynamic.name
                                }]${this.parseDynamicCardtoString(info.card)}`
                            );
                        });
                        dbHandler
                            .update(
                                this.tableName,
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
                    })
                    .catch((e) => {
                        if (e) {
                            log.warn(e);
                        }
                    });
            }
        }, 8000);
    }
}

const dynamic = DynamicSubscriber.getInstance();
export default dynamic;
