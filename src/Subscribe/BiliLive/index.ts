import dbHandler from "../../DBHandler";
import req from "../../Requester";
import log from "../../Logger";
import {
    RequesterErrorType,
    RequesterResponseType,
} from "../../Requester/interface";
import QQMessage from "../../QQMessage";
import { liveRec, liveInfo } from "./live.interface";
import sampler from "../../Util/sampler";
import Util from "../../Util";
import { DBText } from "../../Util/Text";
import config from "../../../config/config.json";
import { Config } from "../../QQMessage/config.interface";
/**
 * 订阅B站的直播
 */

/**
 *
 */

/**
 * 表示查询的结果
 */
interface DBRes {
    lastInsertRowid: number;
    changes: number;
}
class liveSubscriber {
    private static tableName = "bili_live";
    private static __instance: liveSubscriber;

    private async getRoomInfo(uid: number) {
        return new Promise<liveInfo>((res, rej) => {
            req.get({
                url: "https://api.bilibili.com/x/space/acc/info",
                params: {
                    mid: uid,
                },
            })
                //TODO 入队，交给request monitor 调度
                .then((result: RequesterResponseType | RequesterErrorType) => {
                    if (result && (<RequesterResponseType>result).data) {
                        const jsondata = (<RequesterResponseType>result).data;
                        // log.debug(jsondata);
                        if (jsondata.data) {
                            const data = jsondata.data.live_room;
                            if (!data) {
                                log.warn("获取直播间状态失败");
                                return;
                            }
                            res({
                                cover: data.cover,
                                liveStatus: data.liveStatus,
                                url: data.url,
                                online: data.online,
                                title: data.title,
                            } as liveInfo);
                            return;
                        }
                    }
                    log.warn("直播间返回格式错误");
                })
                .catch((error: RequesterErrorType) => {
                    if (error) {
                        rej(error);
                    }
                });
        });
    }
    private async sampleRec(): Promise<liveRec | null> {
        // 获取每个记录的命中次数
        const recs: liveRec[] = await dbHandler.select(
            [liveSubscriber.tableName],
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
                [liveSubscriber.tableName],
                ["count(hit_count) as total"],
                []
            )
        ).total;
        // log.info(total);
        return sampler.sampleWithDist(
            recs,
            recs.map((it: liveRec) => {
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
            let info: liveInfo;
            try {
                info = await this.getRoomInfo(rec.uid);
            } catch (error) {
                if (error) {
                    log.warn(error);
                    return;
                }
                log.error("没有捕获到异常");
                return;
            }

            if (rec.liveStatus == info.liveStatus) {
                log.debug(rec.uid, "直播间状态没有变化");
                return;
            } else if (info.liveStatus == 1) {
                // 命中次数增加
                dbHandler
                    .update(
                        liveSubscriber.tableName,
                        [
                            {
                                k: "hit_count",
                                v: "hit_count+1",
                            },
                            {
                                k: "liveStatus",
                                v: info.liveStatus,
                            },
                        ],
                        [`uid=${DBText(rec.uid.toString())}`]
                    )
                    .then(async (res) => {
                        log.info(res);
                        // log.info("通知更新");
                        const recs: liveRec[] = await dbHandler.select(
                            [liveSubscriber.tableName],
                            ["*"],
                            [`uid=${rec.uid}`],
                            true
                        );
                        recs.forEach((live: liveRec) => {
                            QQMessage.sendToGroup(
                                live.group_id,
                                `${live.name} 的直播开始了\n${info.url}\n[CQ:image,file=${info.cover}]\n` +
                                    `直播间人气 ${info.online} 直播间标题【${info.title}】\n主播id${live.uid}`
                            );
                        });
                    })
                    .catch((e) => {
                        if (e) {
                            log.warn(e);
                        }
                    });
            } else if (info.liveStatus == 0) {
                dbHandler
                    .update(
                        liveSubscriber.tableName,
                        [
                            {
                                k: "liveStatus",
                                v: info.liveStatus,
                            },
                        ],
                        [`uid=${DBText(rec.uid.toString())}`]
                    )
                    .then(async (res) => {
                        log.info(res);
                        const recs: liveRec[] = await dbHandler.select(
                            [liveSubscriber.tableName],
                            ["*"],
                            [`uid=${rec.uid}`],
                            true
                        );
                        recs.forEach((live: liveRec) => {
                            QQMessage.sendToGroup(
                                live.group_id,
                                `${live.name} 的直播结束了\n${info.url}\n[CQ:image,file=${info.cover}]\n` +
                                    `直播间人气 ${info.online} 直播间标题【${info.title}】\n主播id${live.uid}`
                            );
                        });
                    })
                    .catch((e) => {
                        if (e) {
                            log.warn(e);
                        }
                    });
            } else if (info.liveStatus == 2) {
                dbHandler
                    .update(
                        liveSubscriber.tableName,
                        [
                            {
                                k: "liveStatus",
                                v: info.liveStatus,
                            },
                        ],
                        [`uid=${DBText(rec.uid.toString())}`]
                    )
                    .then(async (res) => {
                        log.info(res);
                        const recs: liveRec[] = await dbHandler.select(
                            [liveSubscriber.tableName],
                            ["*"],
                            [`uid=${rec.uid}`],
                            true
                        );
                        recs.forEach((live: liveRec) => {
                            QQMessage.sendToGroup(
                                live.group_id,
                                `${live.name} 的直播进入轮播\n${info.url}\n[CQ:image,file=${info.cover}]\n` +
                                    `直播间人气 ${info.online} 直播间标题【${info.title}】\n主播id${live.uid}`
                            );
                        });
                    })
                    .catch((e) => {
                        if (e) {
                            log.warn(e);
                        }
                    });
            }
        }, 5000);
    }
    // constructor() {
    //     this.run();
    // }
    public static async getInstance(): Promise<liveSubscriber> {
        if (!this.__instance) {
            this.__instance = new liveSubscriber();
            QQMessage;
            await dbHandler.init();
        }
        return this.__instance;
    }
    public async addSub(groupId: number, uid: number, name: string) {
        log.debug("将要添加直播订阅");
        log.debug("group:", groupId, ", uid:", uid, " ,name:", name);
        const chk = await dbHandler.select(
            [liveSubscriber.tableName],
            ["bili_live_id"],
            ["group_id=" + groupId, "uid=" + uid]
        );
        if (chk) {
            log.error("已经添加过该直播订阅了");
            QQMessage.sendToGroup(groupId, "已经添加过该直播订阅了");
            return;
        }
        dbHandler
            .insertSingle(
                liveSubscriber.tableName,
                ["group_id", "uid", "name", "hit_count", "liveStatus"],
                [groupId, uid, name, 1, 0]
            )
            .then((res) => {
                if (res) {
                    //回复订阅成功
                    log.info("添加直播订阅成功");
                    QQMessage.sendToGroup(groupId, `添加${name}直播订阅成功`);
                }
            })
            .catch((rej) => {
                if (rej) {
                    log.warn("添加直播订阅失败，原因");
                    log.warn(rej);
                    QQMessage.sendToGroup(groupId, "添加直播订阅失败");
                }
            });
    }

    public async removeSubByUid(groupId: number, uid: number) {
        log.debug("将要移除直播订阅");
        log.debug("group:", groupId, ", uid:", uid);
        dbHandler
            .delete(liveSubscriber.tableName, [
                "`group_id`=" + groupId,
                "`uid`=" + uid,
            ])
            .then((res) => {
                if ((<DBRes>res).changes > 0) {
                    //回复移除成功
                    log.info(uid, "直播订阅已移除", (<DBRes>res).changes);
                    QQMessage.sendToGroup(groupId, uid + "直播订阅已移除");
                } else {
                    log.warn(
                        "直播移除失败，该群没有订阅uid为[",
                        uid,
                        "]的up主"
                    );
                    QQMessage.sendToGroup(
                        groupId,
                        `直播移除失败，该群没有订阅uid为[${uid}]的up主`
                    );
                }
            })
            .catch((rej) => {
                if (rej) {
                    log.warn(uid, "直播订阅移除失败，原因");
                    log.warn(rej);
                    QQMessage.sendToGroup(groupId, "直播订阅移除失败");
                }
            });
    }
    public async removeSubByName(groupId: number, name: string) {
        log.debug("将要移除直播订阅");
        log.debug("group:", groupId, ", name:", name);
        dbHandler
            .delete(liveSubscriber.tableName, [
                "`group_id` = " + groupId,
                "`name` = '" + name + "'",
            ])
            .then((res) => {
                if ((<DBRes>res).changes > 0) {
                    //回复移除成功
                    log.info(name, "直播订阅已移除", (<DBRes>res).changes);
                    QQMessage.sendToGroup(groupId, name + "直播订阅已移除");
                } else {
                    log.info(
                        "直播移除失败，该群没有订阅名为[",
                        name,
                        "]的up主"
                    );
                    QQMessage.sendToGroup(
                        groupId,
                        `直播移除失败，该群没有订阅名为[${name}]的up主`
                    );
                }
            })
            .catch((rej) => {
                if (rej) {
                    log.warn(name, "直播订阅移除失败，原因");
                    log.warn(rej);
                    QQMessage.sendToGroup(groupId, "直播订阅移除失败");
                }
            });
    }
    public async test(): Promise<void> {
        // log.info("选中的是", JSON.stringify(await this.sampleRec()));
        this.run();
    }
}

const subscriber = liveSubscriber.getInstance();

export default subscriber;
