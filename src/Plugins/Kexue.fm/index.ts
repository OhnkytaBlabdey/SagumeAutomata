import req from "../../Requester";
import PaperSubscriber from "../PaperSubscriber";
import { parseFeed } from "htmlparser2";
import log from "../../Logger";
import {KexueType} from "./type";

class KexueFmSubscriber extends PaperSubscriber{
    tableName = "kexuefm";
    actionName = "科学空间"; // 例如‘直播’
    flagCol = "post_id";
    interval: NodeJS.Timeout | undefined;

    __checkIfValid(rec: KexueType.PostRec, info: KexueType.PostInfo): boolean {
        return rec.post_id == info.latest;
    }

    __generateMsg(info: KexueType.PostInfo): string {
        return `${info.author} 更新了文章 ${info.title}\nhttps://kexue.fm/archives/${info.latest}\n` +
            `发布日期 ${info.pubdate} \n` +
            `简介：${info.desc} ${
                info.desc.length > 200 ? " ..." : " "
            }`;
    }

    async getLatestInfo(): Promise<KexueType.PostInfo | undefined> {
        try {
            let {"data": result} = await req.get({
                url: "https://kexue.fm/feed",
                params: {},
            });
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
                        return {
                            author: "苏剑林",
                            desc: item.description ? item.description : "", //string
                            latest: parseInt(item.id.split("/")[4]), //number
                            link: item.link ? item.link : "", //string
                            pubdate:
                                item.pubDate.toLocaleDateString(
                                    "zh-cn"
                                ),
                            timestamp: new Date(item.pubDate).getTime(),
                            title: item.title ? item.title : "", //string
                        };
                    }
                    log.warn(feed, "格式错误");
                }
            }
        } catch (e) {
            throw e;
        }
    }

    run(): void {
        this.interval = setInterval(this.intervalHandler, 10000);
    }
}

const kexueFM = new KexueFmSubscriber();

export default kexueFM;
