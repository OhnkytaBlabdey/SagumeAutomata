import dbHandler from "../../DBHandler";
import req from "../../Requester";
import log from "../../Logger";
import {
    RequesterErrorType,
    RequesterResponseType,
} from "../../Requester/interface";
import QQMessage from "../../QQMessage";
import { videoInfo, videoRec } from "./video.interface";
import sampler from "../../Util/sampler";
import Util from "../../Util";
import { DBText } from "../../Util/Text";

/**
 * 订阅B站的视频
 */

// 每个文件来点二刺螈语录
/**
 * victory lies in a simple soul.
 *  								____ RWBY vol.1
 */

/**
 * 表示查询的结果
 */
interface DBRes {
    lastInsertRowid: number;
    changes: number;
}
class videoSubscriber {
    private static tableName = "bili_video";
    private static __instance: videoSubscriber;

    private async getLatestVideo(uid: number) {
        return new Promise<videoInfo>((res, rej) => {
            req.get({
                url: "https://api.bilibili.com/x/space/arc/search",
                params: {
                    mid: uid,
                    ps: 1,
                },
            })
                //TODO 入队，交给request monitor 调度
                .then((result: RequesterResponseType | RequesterErrorType) => {
                    if (result && (<RequesterResponseType>result).data) {
                        const jsondata = (<RequesterResponseType>result).data;
                        // log.debug(jsondata);
                        if (jsondata.data) {
                            const data = jsondata.data;
                            if (data["list"] && data["list"]["vlist"]) {
                                const item = data["list"]["vlist"][0];
                                res({
                                    av: item.aid, //number
                                    cover: item.pic, //string
                                    desc: item.description, //string
                                    length: item.length, //string
                                    pubdate: new Date(
                                        item.created * 1000
                                    ).toLocaleDateString("zh-cn"),
                                    title: item.title, //string
                                } as videoInfo);
                                return;
                            }
                        }
                    }
                    log.warn("视频返回格式错误");
                })
                .catch((error: RequesterErrorType) => {
                    if (error) {
                        rej(error);
                    }
                });
        });
    }
    private async sampleRec(): Promise<videoRec | null> {
        // 获取每个记录的命中次数
        const recs: videoRec[] = await dbHandler.select(
            [videoSubscriber.tableName],
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
                [videoSubscriber.tableName],
                ["count(hit_count) as total"],
                []
            )
        ).total;
        // log.info(total);
        return sampler.sampleWithDist(
            recs,
            recs.map((it: videoRec) => {
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
            const info: videoInfo = await this.getLatestVideo(rec.uid);
            if (rec.latest_av == info.av) {
                // log.info(rec.uid, "最新视频没有变化");
                return;
            } else {
                // 命中次数增加
                dbHandler
                    .update(
                        videoSubscriber.tableName,
                        [
                            {
                                k: "hit_count",
                                v: "hit_count+1",
                            },
                            {
                                k: "latest_av",
                                v: info.av,
                            },
                        ],
                        [`uid=${DBText(rec.uid.toString())}`]
                    )
                    .then(async (res) => {
                        log.info(res);
                        // log.info("通知更新");
                        const recs: videoRec[] = await dbHandler.select(
                            [videoSubscriber.tableName],
                            ["*"],
                            [`uid=${rec.uid}`],
                            true
                        );
                        recs.forEach((av: videoRec) => {
                            QQMessage.sendToGroup(
                                av.group_id,
                                `${av.name} 更新了视频 ${info.title}\nb23.tv/av${av.latest_av}\n[CQ:image,file=${info.cover}]\n` +
                                    `发布日期 ${info.pubdate} 视频时长【${info.length}】\n` +
                                    `视频简介：${info.desc} ${
                                        info.desc.length > 200 ? " ..." : " "
                                    }`
                            );
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
    public static async getInstance(): Promise<videoSubscriber> {
        if (!this.__instance) {
            this.__instance = new videoSubscriber();
            QQMessage;
            await dbHandler.init();
        }
        return this.__instance;
    }
    public async addSub(groupId: number, uid: number, name: string) {
        log.debug("将要添加视频订阅");
        log.debug("group:", groupId, ", uid:", uid, " ,name:", name);
        const chk = await dbHandler.select(
            [videoSubscriber.tableName],
            ["bili_video_id"],
            ["group_id=" + groupId, "uid=" + uid]
        );
        if (chk) {
            log.error("已经添加过该视频订阅了");
            QQMessage.sendToGroup(groupId, "已经添加过该视频订阅了");
            return;
        }
        dbHandler
            .insertSingle(
                videoSubscriber.tableName,
                ["group_id", "uid", "name", "hit_count", "latest_av"],
                [groupId, uid, name, 1, 0]
            )
            .then((res) => {
                if (res) {
                    //回复订阅成功
                    log.info("添加视频订阅成功");
                    QQMessage.sendToGroup(groupId, `添加${uid}视频订阅成功`);
                }
            })
            .catch((rej) => {
                if (rej) {
                    log.warn("添加视频订阅失败，原因");
                    log.warn(rej);
                    QQMessage.sendToGroup(groupId, "添加视频订阅失败");
                }
            });
    }

    public async removeSubByUid(groupId: number, uid: number) {
        log.debug("将要移除视频订阅");
        log.debug("group:", groupId, ", uid:", uid);
        dbHandler
            .delete(videoSubscriber.tableName, [
                "`group_id`=" + groupId,
                "`uid`=" + uid,
            ])
            .then((res) => {
                if ((<DBRes>res).changes > 0) {
                    //回复移除成功
                    log.info(uid, "视频订阅已移除", (<DBRes>res).changes);
                    QQMessage.sendToGroup(groupId, uid + "视频订阅已移除");
                } else {
                    log.warn(
                        "视频移除失败，该群没有订阅uid为[",
                        uid,
                        "]的up主"
                    );
                    QQMessage.sendToGroup(
                        groupId,
                        `视频移除失败，该群没有订阅uid为[${uid}]的up主`
                    );
                }
            })
            .catch((rej) => {
                if (rej) {
                    log.warn(uid, "视频订阅移除失败，原因");
                    log.warn(rej);
                    QQMessage.sendToGroup(groupId, "视频订阅移除失败");
                }
            });
    }
    public async removeSubByName(groupId: number, name: string) {
        log.debug("将要移除视频订阅");
        log.debug("group:", groupId, ", name:", name);
        dbHandler
            .delete(videoSubscriber.tableName, [
                "`group_id` = " + groupId,
                "`name` = '" + name + "'",
            ])
            .then((res) => {
                if ((<DBRes>res).changes > 0) {
                    //回复移除成功
                    log.info(name, "视频订阅已移除", (<DBRes>res).changes);
                    QQMessage.sendToGroup(groupId, name + "视频订阅已移除");
                } else {
                    log.info(
                        "视频移除失败，该群没有订阅名为[",
                        name,
                        "]的up主"
                    );
                    QQMessage.sendToGroup(
                        groupId,
                        `视频移除失败，该群没有订阅name为[${name}]的up主`
                    );
                }
            })
            .catch((rej) => {
                if (rej) {
                    log.warn(name, "视频订阅移除失败，原因");
                    log.warn(rej);
                    QQMessage.sendToGroup(groupId, "视频订阅移除失败");
                }
            });
    }
    public async test(): Promise<void> {
        // log.info("选中的是", JSON.stringify(await this.sampleRec()));
        this.run();
    }
}

const subscriber = videoSubscriber.getInstance();

export default subscriber;
