import dbHandler from "../../../../DBHandler";
import req from "../../../../Requester";
import log from "../../../../Logger";
import { RequesterResponseType } from "../../../../Requester/interface";
import QQMessage from "../../../../QQMessage";
import { liveRec, liveInfo } from "./live.interface";
import Subscriber from "../Subscriber";
/**
 * 订阅B站的直播
 */

/**
 *	あの鸟はまだ うまく飞べないけど
    いつかは风を切って知る					____ 鳥の詩 《AIR》 OP
 */

/**
 * 订阅直播
 */

class LiveSubscriber extends Subscriber {
    private static __instance: LiveSubscriber;
    tableName = "bili_live";
    actionName = "直播";
    flagCol = "liveStatus";
    constructor() {
        super();
    }
    getLatestInfo(uid: number) {
        return new Promise<liveInfo>((res, rej) => {
            req.get({
                url: "https://api.bilibili.com/x/space/acc/info",
                params: {
                    mid: uid,
                },
            })
                //TODO 入队，交给request monitor 调度
                .then((result: RequesterResponseType) => {
                    if (result && result.data) {
                        const jsondata = result.data;
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
                .catch((error) => {
                    if (error) {
                        rej(error);
                    }
                });
        });
    }

    public run(): void {
        setInterval(async () => {
            const rec = (await this.sampleRec()) as liveRec;
            if (rec == null) {
                return;
            }
            let info: liveInfo;
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
                log.info("获取直播间状态失败");
                return;
            }

            if (rec.liveStatus == info.liveStatus) {
                log.debug(rec.uid, "直播间状态没有变化");
                return;
            } else if (info.liveStatus == 1) {
                // 命中次数增加
                dbHandler
                    .update(
                        this.tableName,
                        [
                            {
                                k: "hit_count",
                                v: "hit_count+1",
                            },
                            {
                                k: this.flagCol,
                                v: info.liveStatus,
                            },
                        ],
                        [
                            `uid=${rec.uid}`,
                            `${this.flagCol}!=${info.liveStatus}`,
                        ]
                    )
                    .then(async (res) => {
                        log.info(res);
                        const recs: liveRec[] = await dbHandler.select(
                            [this.tableName],
                            ["*"],
                            [
                                `uid=${rec.uid}`,
                                `before_update!=${info.liveStatus}`,
                            ],
                            true
                        );
                        recs.forEach((live: liveRec) => {
                            QQMessage.sendToGroup(
                                live.group_id,
                                `${live.name} 的直播开始了\n${info.url}\n[CQ:image,file=${info.cover}]\n` +
                                    `直播间人气 ${info.online} 直播间标题【${info.title}】\n主播 https://space.bilibili.com/${live.uid}`
                            );
                        });
                        dbHandler
                            .update(
                                this.tableName,
                                [
                                    {
                                        k: "before_update",
                                        v: info.liveStatus,
                                    },
                                ],
                                [
                                    `uid=${rec.uid}`,
                                    `before_update!=${info.liveStatus}`,
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
            } else if (info.liveStatus == 0) {
                dbHandler
                    .update(
                        this.tableName,
                        [
                            {
                                k: "liveStatus",
                                v: info.liveStatus,
                            },
                        ],
                        [`uid=${rec.uid}`, `liveStatus!=${info.liveStatus}`]
                    )
                    .then(async (res) => {
                        log.info(res);
                        const recs: liveRec[] = await dbHandler.select(
                            [this.tableName],
                            ["*"],
                            [
                                `uid=${rec.uid}`,
                                `before_update!=${info.liveStatus}`,
                            ],
                            true
                        );
                        recs.forEach((live: liveRec) => {
                            QQMessage.sendToGroup(
                                live.group_id,
                                `${live.name} 的直播结束了\n${info.url}\n[CQ:image,file=${info.cover}]\n` +
                                    `直播间人气 ${info.online} 直播间标题【${info.title}】\n主播 https://space.bilibili.com/${live.uid}`
                            );
                        });
                        dbHandler
                            .update(
                                this.tableName,
                                [
                                    {
                                        k: "before_update",
                                        v: info.liveStatus,
                                    },
                                ],
                                [
                                    `uid=${rec.uid}`,
                                    `before_update!=${info.liveStatus}`,
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
            } else if (info.liveStatus == 2) {
                dbHandler
                    .update(
                        this.tableName,
                        [
                            {
                                k: "liveStatus",
                                v: info.liveStatus,
                            },
                        ],
                        [`uid=${rec.uid}`, `liveStatus!=${info.liveStatus}`]
                    )
                    .then(async (res) => {
                        log.info(res);
                        const recs: liveRec[] = await dbHandler.select(
                            [this.tableName],
                            ["*"],
                            [
                                `uid=${rec.uid}`,
                                `before_update!=${info.liveStatus}`,
                            ],
                            true
                        );
                        recs.forEach((live: liveRec) => {
                            QQMessage.sendToGroup(
                                live.group_id,
                                `${live.name} 的直播进入轮播\n${info.url}\n[CQ:image,file=${info.cover}]\n` +
                                    `直播间人气 ${info.online} 直播间标题【${info.title}】\n主播 https://space.bilibili.com/${live.uid}`
                            );
                        });
                        dbHandler
                            .update(
                                this.tableName,
                                [
                                    {
                                        k: "before_update",
                                        v: info.liveStatus,
                                    },
                                ],
                                [
                                    `uid=${rec.uid}`,
                                    `before_update!=${info.liveStatus}`,
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
        }, 6000);
    }

    public static getInstance(): LiveSubscriber {
        if (!this.__instance) {
            this.__instance = new LiveSubscriber();
        }
        return this.__instance;
    }

    public async test(): Promise<void> {
        this.run();
    }
}

const subscriber = LiveSubscriber.getInstance();

export default subscriber;
