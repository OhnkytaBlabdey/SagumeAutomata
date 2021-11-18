import { postInfo, postRec } from "./post.interface";
import { DBRes } from "../Bili/Subscriber";
import log from "../../../Logger";
import dbHandler from "../../../DBHandler";
import QQMessage from "../../../QQMessage";
import req from "../../../Requester";
import { RequesterResponseType } from "../../../Requester/interface";
import { parseFeed } from "htmlparser2";

class BAIRSubscriber {
    private tableName = "bair";
    private actionName = "BAIR"; // 例如‘直播’
    private flagCol = "post_ts"; // 例如‘liveStatus’
    private static __instance: BAIRSubscriber;

    public static getInstance(): BAIRSubscriber {
        if (!this.__instance) {
            this.__instance = new BAIRSubscriber();
        }
        return this.__instance;
    }

    private getLatestInfo(): Promise<postInfo> {
        // https://bair.berkeley.edu/blog/feed.xml
        return new Promise<postInfo>((res, rej) => {
            req.get({
                url: "https://bair.berkeley.edu/blog/feed.xml",
                params: {},
            })
                //TODO 入队，交给request monitor 调度
                .then((result: RequesterResponseType) => {
                    if (result && result.data) {
                        const xmlStr = result.data;
                        const feed = parseFeed(xmlStr);
                        if (feed) {
                            const items = feed.items;

                            if (items && items?.length > 0) {
                                const item = items[0];
                                if (!item) {
                                    log.warn("获取最新博客失败");
                                    return;
                                }
                                if (!item.id || !item.pubDate) {
                                    log.warn(item, "格式错误");
                                    return;
                                }
                                res({
                                    desc: item.description, //string
                                    latest: new Date(item.pubDate).getTime(), //number
                                    link: item.link, //string
                                    pubdate:
                                        item.pubDate.toLocaleDateString(
                                            "zh-cn"
                                        ),
                                    timestamp: new Date(item.pubDate).getTime(),
                                    title: item.title, //string
                                } as postInfo);
                                return;
                            }
                            log.warn(feed, "格式错误");
                        }
                    }
                    log.warn(result.data, "BAIR订阅返回格式错误");
                })
                .catch((error) => {
                    if (error) {
                        rej(error);
                    }
                });
        });
    }
    public test(): any {
        return this.getLatestInfo();
    }

    public run(): void {
        setInterval(async () => {
            const rec: postRec = await dbHandler.run(
                `select * from ${this.tableName} order by timestamp asc limit 1`
            );
            if (rec == null) {
                log.warn(`没有${this.actionName}订阅记录`);
                return;
            }
            let info: postInfo;
            try {
                info = await this.getLatestInfo();
            } catch (error: any) {
                if (error) {
                    log.warn(error.errMessage ? error.errMessage : error);
                    return;
                }
                log.error("没有捕获到异常");
                return;
            }

            if (!info) {
                log.info("获取最新文章失败");
                return;
            }

            if (rec.post_ts == info.latest) {
                log.debug("最新文章没有变化");
                return;
            } else if (rec.timestamp > info.timestamp) {
                log.info("删除了文章");
                return;
            } else {
                const recs: postRec[] = await dbHandler.select(
                    [this.tableName],
                    ["*"],
                    [`${this.flagCol}!=${info.latest}`],
                    true
                );
                recs.forEach((rec: postRec) => {
                    QQMessage.sendToGroup(
                        rec.group_id,
                        `BAIR更新了文章 ${info.title}\n${info.link}\n` +
                            `发布日期 ${info.pubdate} \n`
                        // TODO 渲染html
                        //  + `简介：${info.desc} ${
                        //     info.desc.length > 200 ? " ..." : " "
                        // }`
                    );
                });
                dbHandler
                    .update(
                        this.tableName,
                        [
                            {
                                k: `${this.flagCol}`,
                                v: info.latest,
                            },
                        ],
                        [`${this.flagCol}!=${info.latest}`]
                    )
                    .catch((e) => {
                        if (e) {
                            log.warn(e);
                        }
                    });
            }
        }, 120000);
    }

    public async addSub(groupId: number): Promise<boolean> {
        log.debug(`将要添加${this.actionName}订阅`);
        log.debug("group:", groupId);
        const chk = await dbHandler.select(
            [this.tableName],
            ["*"],
            ["group_id=" + groupId]
        );
        if (chk) {
            log.error(`已经添加过${this.actionName}订阅了`);
            (await QQMessage).sendToGroup(
                groupId,
                `此群已经添加过${this.actionName}订阅了`
            );
            return false;
        }
        dbHandler
            .insertSingle(
                this.tableName,
                ["group_id", this.flagCol],
                [groupId, 0]
            )
            .then(async (res) => {
                if (res) {
                    //回复订阅成功
                    log.info(`添加${this.actionName}订阅成功`);
                    (await QQMessage).sendToGroup(
                        groupId,
                        `添加${this.actionName}订阅成功`
                    );
                    return true;
                }
            })
            .catch(async (rej) => {
                if (rej) {
                    log.warn(`添加${this.actionName}订阅失败，原因`);
                    log.warn(rej);
                    (await QQMessage).sendToGroup(
                        groupId,
                        `添加${this.actionName}订阅失败`
                    );
                    return false;
                }
            });
        return false;
    }

    public async removeSub(groupId: number): Promise<void> {
        log.debug(`将要移除${this.actionName}订阅`);
        log.debug("group:", groupId);
        dbHandler
            .delete(this.tableName, ["`group_id`=" + groupId])
            .then(async (res) => {
                if ((<DBRes>res).changes > 0) {
                    //回复移除成功
                    log.info(
                        `${this.actionName}订阅已移除`,
                        (<DBRes>res).changes
                    );
                    (await QQMessage).sendToGroup(
                        groupId,
                        `${this.actionName}订阅已移除`
                    );
                } else {
                    log.warn(`${this.actionName}移除失败，该群没有订阅`);
                    (await QQMessage).sendToGroup(
                        groupId,
                        `${this.actionName}移除失败，该群没有订阅`
                    );
                }
            })
            .catch(async (rej) => {
                if (rej) {
                    log.warn(`${this.actionName}订阅移除失败，原因`);
                    log.warn(rej);
                    (await QQMessage).sendToGroup(
                        groupId,
                        `${this.actionName}订阅移除失败`
                    );
                }
            });
    }
}
const KexueFM = BAIRSubscriber.getInstance();
export default KexueFM;