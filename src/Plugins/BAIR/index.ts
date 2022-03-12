import PaperSubscriber from "../PaperSubscriber";
import req from "../../Requester";
import log from "../../Logger";
import { parseFeed } from "htmlparser2";
import {BAIRType} from "./type";

class BAIRSubscriber extends PaperSubscriber {
    tableName = "bair";
    actionName = "BAIR";
    flagCol = "post_ts";
    interval: NodeJS.Timeout | undefined;
    constructor() {
        super();
        this.addSub = this.addSub.bind(this);
        this.removeSub = this.removeSub.bind(this);
        this.intervalHandler = this.intervalHandler.bind(this);
    }

    __checkIfValid(rec: BAIRType.PostRec, info: BAIRType.PostInfo): boolean {
        return rec.post_ts == info.latest;
    }

    __generateMsg(info: BAIRType.PostInfo): string {
        return `BAIR更新了文章 ${info.title}\n${info.link}\n` +
            `发布日期 ${info.pubdate} \n`;
    }

    async getLatestInfo(): Promise<BAIRType.PostInfo | undefined> {
        try {
            let {"data": result} = await req.get({
                url: "https://bair.berkeley.edu/blog/feed.xml",
                params: {},
            });
            if (result) {
                const feed = parseFeed(result);
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
                        return {
                            desc: item.description ? item.description : "",
                            latest: new Date(item.pubDate).getTime(),
                            link: item.link ? item.link : "",
                            pubdate: item.pubDate.toLocaleDateString("zh-cn"),
                            timestamp: new Date(item.pubDate).getTime(),
                            title: item.title ? item.title : ""
                        };
                    }
                    log.warn(feed, "格式错误");
                }
            }
            log.warn(result.data, "BAIR订阅返回格式错误");
        } catch (e) {
            throw e;
        }
    }

    run(): void {
        this.interval = setInterval(this.intervalHandler, 10000);
    }
}

const BAIR = new BAIRSubscriber();

export default BAIR;
