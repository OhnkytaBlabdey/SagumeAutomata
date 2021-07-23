import dbHandler from "../../DBHandler";
import req from "../../Requester";
import log from "../../Logger";
import { RequesterResponseType } from "../../Requester/interface";
import QQMessage from "../../QQMessage";
import { videoInfo, videoRec } from "./video.interface";
import { DBText } from "../../Util/Text";
import Subscriber from "..";
/**
 * 订阅B站的视频
 */

/**
 * victory lies in a simple soul.
 *  								____ RWBY vol.1
 */

/**
 * 订阅视频
 */
class videoSubscriber extends Subscriber {
    private static __instance: videoSubscriber;
    tableName = "bili_video";
    actionName = "视频";
    flagCol = "latest_av";
    constructor() {
        super();
    }

    getLatestInfo(uid: number) {
        return new Promise<videoInfo>((res, rej) => {
            req.get({
                url: "https://api.bilibili.com/x/space/arc/search",
                params: {
                    mid: uid,
                    ps: 1,
                },
            })
                //TODO 入队，交给request monitor 调度
                .then((result: RequesterResponseType) => {
                    if (result && result.data) {
                        const jsondata = result.data;
                        // log.debug(jsondata);
                        if (jsondata.data) {
                            const data = jsondata.data;
                            if (data["list"] && data["list"]["vlist"]) {
                                const item = data["list"]["vlist"][0];
                                if (!item) {
                                    log.warn("获取最新视频失败");
                                    return;
                                }
                                res({
                                    av: item.aid, //number
                                    cover: item.pic, //string
                                    desc: item.description, //string
                                    length: item.length, //string
                                    pubdate: new Date(
                                        item.created * 1000
                                    ).toLocaleDateString("zh-cn"),
                                    title: item.title, //string
                                    timestamp: item.created,
                                } as videoInfo);
                                return;
                            }
                        }
                    }
                    log.warn("视频返回格式错误");
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
            const rec = (await this.sampleRec()) as videoRec;
            if (rec == null) {
                return;
            }
            let info: videoInfo;
            try {
                info = await this.getLatestInfo(rec.uid);
            } catch (error) {
                if (error) {
                    log.warn(error.errMessage ? error.errMessage : error);
                    return;
                }
                log.error("没有捕获到异常");
                return;
            }

            if (!info) {
                log.info("获取最新视频失败");
                return;
            }

            if (rec.latest_av == info.av) {
                log.debug(rec.uid, "最新视频没有变化");
                return;
            } else if (rec.ctime > info.timestamp) {
                log.info(rec.uid, "删除了视频");
                return;
            } else {
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
                                k: "ctime",
                                v: info.timestamp,
                            },
                            {
                                k: this.flagCol,
                                v: info.av,
                            },
                        ],
                        [
                            `uid=${DBText(rec.uid.toString())}`,
                            `${this.flagCol}!=${info.av}`,
                        ]
                    )
                    .then(async (res) => {
                        log.info(res);
                        // log.info("通知更新");
                        const recs: videoRec[] = await dbHandler.select(
                            [this.tableName],
                            ["*"],
                            [`uid=${rec.uid}`, `before_update!=${info.av}`],
                            true
                        );
                        recs.forEach(async (av: videoRec) => {
                            (await QQMessage).sendToGroup(
                                av.group_id,
                                `${av.name} 更新了视频 ${info.title}\nb23.tv/av${av.latest_av}\n[CQ:image,file=${info.cover}]\n` +
                                    `发布日期 ${info.pubdate} 视频时长【${info.length}】\n` +
                                    `视频简介：${info.desc} ${
                                        info.desc.length > 200 ? " ..." : " "
                                    }`
                            );
                        });
                        dbHandler
                            .update(
                                this.tableName,
                                [
                                    {
                                        k: "before_update",
                                        v: info.av,
                                    },
                                ],
                                [`uid=${rec.uid}`, `before_update!=${info.av}`]
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
    public static async getInstance(): Promise<videoSubscriber> {
        if (!this.__instance) {
            this.__instance = new videoSubscriber();
            QQMessage;
            await dbHandler.init();
        }
        return this.__instance;
    }

    public async test(): Promise<void> {
        // log.info("选中的是", JSON.stringify(await this.sampleRec()));
        this.run();
    }
}

const subscriber = videoSubscriber.getInstance();

export default subscriber;
