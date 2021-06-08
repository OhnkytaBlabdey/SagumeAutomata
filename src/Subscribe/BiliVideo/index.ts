import dbHandler from "../../DBHandler";
import req from "../../Requester";
import log from "../../Logger";
import {
    RequesterErrorType,
    RequesterResponseType,
} from "../../Requester/interface";

/**
 * victory lies in a simple soul.
 *  								____ RWBY vol.1
 */

class videoSubscriber {
    private static tableName = "bili_video";
    private static __instance: videoSubscriber;

    private async getLatestVideo(uid: number) {
        return new Promise((res, rej) => {
            req.get({
                url: "https://api.bilibili.com/x/space/arc/search",
                params: {
                    mid: uid,
                    ps: 1,
                },
            })
                .then((result: RequesterResponseType) => {
                    if (result && result.data) {
                        const jsondata = result.data;
                        log.debug(jsondata);
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
                                });
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
    public static async getInstance(): Promise<videoSubscriber> {
        if (!this.__instance) {
            this.__instance = new videoSubscriber();
            await dbHandler.init();
        }
        return this.__instance;
    }
    public async addSub(groupId: number, uid: number, name: string) {
        log.info("将要添加视频订阅");
        log.info("group:", groupId, ", uid:", uid, " ,name:", name);
        const chk = await dbHandler.select(
            [videoSubscriber.tableName],
            ["bili_video_id"],
            ["group_id=" + groupId, "uid=" + uid, "`name`='" + name + "'"]
        );
        if (chk) {
            log.error("已经添加过该视频订阅了");
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
                }
            })
            .catch((rej) => {
                if (rej) {
                    log.warn("添加视频订阅失败，原因");
                    log.warn(rej);
                }
            });
    }

    public async removeSubByUid(groupId: number, uid: number) {
        log.info("将要移除视频订阅");
        log.info("group:", groupId, ", uid:", uid);
        dbHandler
            .delete(videoSubscriber.tableName, [
                "`group_id`=" + groupId,
                "`uid`=" + uid,
            ])
            .then((res) => {
                if (res) {
                    //回复移除成功
                    log.info(uid, "视频订阅已移除", res);
                }
            })
            .catch((rej) => {
                if (rej) {
                    log.warn(uid, "视频订阅移除失败，原因");
                    log.warn(rej);
                }
            });
    }
    public async removeSubByName(groupId: number, name: string) {
        log.info("将要移除视频订阅");
        log.info("group:", groupId, ", name:", name);
        dbHandler
            .delete(videoSubscriber.tableName, [
                "`group_id` = " + groupId,
                "`name` = '" + name + "'",
            ])
            .then((res) => {
                if (res) {
                    //回复移除成功
                    log.info(name, "视频订阅已移除", res);
                }
            })
            .catch((rej) => {
                if (rej) {
                    log.warn(name, "视频订阅移除失败，原因");
                    log.warn(rej);
                }
            });
    }
}

const subscriber = videoSubscriber.getInstance();

export default subscriber;
