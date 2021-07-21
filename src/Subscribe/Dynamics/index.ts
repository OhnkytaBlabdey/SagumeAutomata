import dbHandler from "../../DBHandler";
import req from "../../Requester";
import log from "../../Logger";
import QQMessage from "../../QQMessage";
import { dynamicInfo, dynamicRec } from "./dynamic.interface";
import { RequesterResponseType } from "../../Requester/interface";
import sampler from "../../Util/sampler";

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
 * 表示查询的结果
 */
interface DBRes {
    lastInsertRowid: number;
    changes: number;
}
class DynamicSubscriber {
    private static tableName = "bili_dynamic";
    private static __instance: DynamicSubscriber;
    public static async getInstance(): Promise<DynamicSubscriber> {
        if (!this.__instance) {
            this.__instance = new DynamicSubscriber();
            QQMessage;
            await dbHandler.init();
        }
        return this.__instance;
    }
    private async getLatestItem(uid: number) {
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
    private parseDynamicCardtoString(cardStr: string): string {
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
            if (itm.pictures) {
                // 转发图片
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
                return (
                    `转发了动态 评论：${comment}\n 原动态：` + origDynamicStr
                );
            } else {
                // 投票详情在JSON.parse(card.origin_extension)中
                return `转发了动态 评论：${comment}\n 原动态：${itm.content}`;
            }
        } else {
            // TODO 原创动态
            const itm = card.item;
            if (!itm) {
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
                return `发布了动态 ${itm.content}`;
            }
        }
    }
    private async sampleRec(): Promise<dynamicRec | null> {
        // 获取每个记录的命中次数
        const recs: dynamicRec[] = await dbHandler.select(
            [DynamicSubscriber.tableName],
            ["*"],
            [],
            true
        );
        if (recs.length == 0) {
            log.warn("数据库里没有记录");
            return null;
        }
        const total: number = (
            await dbHandler.select(
                [DynamicSubscriber.tableName],
                ["count(hit_count) as total"],
                []
            )
        ).total;
        return sampler.sampleWithDist(
            recs,
            recs.map((it: dynamicRec) => {
                return it.hit_count / total;
            })
        );
    }

    public run(): void {
        setInterval(async () => {
            const rec = await this.sampleRec();
            if (rec == null) {
                return;
            }
            let info: dynamicInfo;
            try {
                info = await this.getLatestItem(rec.uid);
            } catch (error) {
                if (error) {
                    log.warn((<Error>error).message);
                    return;
                }
                log.error("没有捕获到异常");
                return;
            }

            if (!info) {
                log.warn("获取最新动态失败");
                return;
            }

            if (rec.latest_dynamic == info.dynamic_id) {
                log.debug(rec.uid, "最新动态没有变化");
                return;
            } else {
                // 命中次数增加
                dbHandler
                    .update(
                        DynamicSubscriber.tableName,
                        [
                            {
                                k: "hit_count",
                                v: "hit_count+1",
                            },
                            {
                                k: "dynamic_id",
                                v: info.dynamic_id,
                            },
                        ],
                        [`uid=${rec.uid}`, `dynamic_id!=${info.dynamic_id}`]
                    )
                    .then(async (res) => {
                        log.info(res);
                        // log.info("通知更新");
                        const recs: dynamicRec[] = await dbHandler.select(
                            [DynamicSubscriber.tableName],
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
                                `${dynamic.name}${this.parseDynamicCardtoString(
                                    info.card
                                )}`
                            );
                        });
                        dbHandler
                            .update(
                                DynamicSubscriber.tableName,
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
        }, 4000);
    }
    public async addSub(groupId: number, uid: number, name: string) {
        log.debug("将要添加动态订阅");
        log.debug("group:", groupId, ", uid:", uid, " ,name:", name);
        const chk = await dbHandler.select(
            [DynamicSubscriber.tableName],
            ["bili_video_id"],
            ["group_id=" + groupId, "uid=" + uid]
        );
        if (chk) {
            log.error("已经添加过该动态订阅了");
            QQMessage.sendToGroup(groupId, "已经添加过该动态订阅了");
            return;
        }
        dbHandler
            .insertSingle(
                DynamicSubscriber.tableName,
                [
                    "group_id",
                    "uid",
                    "name",
                    "hit_count",
                    "latest_dynamic_id",
                    "before_update",
                ],
                [groupId, uid, name, 1, 0, 0]
            )
            .then((res) => {
                if (res) {
                    //回复订阅成功
                    log.info("添加动态订阅成功");
                    QQMessage.sendToGroup(groupId, `添加${uid}动态订阅成功`);
                }
            })
            .catch((rej) => {
                if (rej) {
                    log.warn("添加动态订阅失败，原因");
                    log.warn(rej);
                    QQMessage.sendToGroup(groupId, "添加动态订阅失败");
                }
            });
    }

    public async removeSubByUid(groupId: number, uid: number) {
        log.debug("将要移除动态订阅");
        log.debug("group:", groupId, ", uid:", uid);
        dbHandler
            .delete(DynamicSubscriber.tableName, [
                "`group_id`=" + groupId,
                "`uid`=" + uid,
            ])
            .then((res) => {
                if ((<DBRes>res).changes > 0) {
                    //回复移除成功
                    log.info(uid, "动态订阅已移除", (<DBRes>res).changes);
                    QQMessage.sendToGroup(groupId, uid + "动态订阅已移除");
                } else {
                    log.warn(
                        "动态移除失败，该群没有订阅uid为[",
                        uid,
                        "]的up主"
                    );
                    QQMessage.sendToGroup(
                        groupId,
                        `动态移除失败，该群没有订阅uid为[${uid}]的up主`
                    );
                }
            })
            .catch((rej) => {
                if (rej) {
                    log.warn(uid, "动态订阅移除失败，原因");
                    log.warn(rej);
                    QQMessage.sendToGroup(groupId, "动态订阅移除失败");
                }
            });
    }
    public async removeSubByName(groupId: number, name: string) {
        log.debug("将要移除动态订阅");
        log.debug("group:", groupId, ", name:", name);
        dbHandler
            .delete(DynamicSubscriber.tableName, [
                "`group_id` = " + groupId,
                "`name` = '" + name + "'",
            ])
            .then((res) => {
                if ((<DBRes>res).changes > 0) {
                    //回复移除成功
                    log.info(name, "动态订阅已移除", (<DBRes>res).changes);
                    QQMessage.sendToGroup(groupId, name + "动态订阅已移除");
                } else {
                    log.info(
                        "动态移除失败，该群没有订阅名为[",
                        name,
                        "]的up主"
                    );
                    QQMessage.sendToGroup(
                        groupId,
                        `动态移除失败，该群没有订阅name为[${name}]的up主`
                    );
                }
            })
            .catch((rej) => {
                if (rej) {
                    log.warn(name, "动态订阅移除失败，原因");
                    log.warn(rej);
                    QQMessage.sendToGroup(groupId, "视频订阅移除失败");
                }
            });
    }
}

const dynamic = DynamicSubscriber.getInstance();
export default dynamic;
