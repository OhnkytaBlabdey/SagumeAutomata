import dbHandler from "../../DBHandler";
import req from "../../Requester";
import log from "../../Logger";
import QQMessage from "../../QQMessage";
import { dynamicInfo } from "./dynamic.interface";
import { RequesterResponseType } from "../../Requester/interface";

class DynamicSubscriber {
    private static __instance: DynamicSubscriber;
    public static async getInstance(): Promise<DynamicSubscriber> {
        if (!this.__instance) {
            this.__instance = new DynamicSubscriber();
            QQMessage;
            await dbHandler.init();
        }
        return this.__instance;
    }
    public async getLatestItem(uid: number) {
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
                        dynamic_id: cards[0].desc.dynamic_id,
                        timestamp: cards[0].desc.timestamp,
                        card: cards[0].card,
                    } as dynamicInfo);
                })
                .catch((error: Error) => {
                    if (error) {
                        rej(error);
                    }
                });
        });
    }
    public parseDynamicCardtoString(cardStr: string): string {
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
            if (card.up_from_v2) {
                // TODO 投稿视频（？）
                return "投稿了视频" + videoText;
            } else {
                // TODO 转发视频（？）
                const comment = card.dynamic;
                return "转发了视频" + `转发评论：${comment}\n原` + videoText;
            }
        } else if (card.origin) {
            // TODO 转发动态（？）
            // origin.item
            // if (!item.origin) {
            //     log.warn("无法解析");
            //     return "无法解析的格式";
            // }
            let originItem = null;
            try {
                originItem = JSON.parse(card.origin);
            } catch (ex) {
                log.warn(ex);
                return "解析失败";
            }
            const comment = card.item.content;
            const itm = originItem.item;
            if (!itm) {
                log.warn("格式错误");
                return "无法解析的格式";
            }

            const desc: string = itm.description;
            const picCount: number = itm.pictures_count;
            const pictures: any[] = itm.pictures;
            let origDynamicStr = desc;
            if (picCount > 0) {
                const picCQs = pictures
                    .map((pic) => {
                        return `[CQ:image,file=${pic.img_src}]`;
                    })
                    .reduce((prev, cur) => prev + "\n" + cur);
                origDynamicStr += picCQs;
            }
            return `转发了动态 评论：${comment}\n 原动态：` + origDynamicStr;
        } else {
            // TODO 原创动态
            const itm = card.item;
            if (!itm) {
                log.warn("无法解析");
                return "无法解析的格式";
            }
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
        }
    }
}

const dynamic = DynamicSubscriber.getInstance();
export default dynamic;
