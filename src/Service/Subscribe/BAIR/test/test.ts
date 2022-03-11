import { postInfo } from "../post.interface";
import log from "../../../../Logger";
import req from "../../../../Requester";
import { RequesterResponseType } from "../../../../Requester/interface";
import { parseFeed } from "htmlparser2";

function getLatestInfo(): Promise<postInfo> {
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
                                    item.pubDate.toLocaleDateString("zh-cn"),
                                timestamp: new Date(item.pubDate).getTime(),
                                title: item.title, //string
                            } as postInfo);
                            return;
                        }
                        log.warn(feed, "格式错误");
                    }
                }
                log.warn(result.data, "科学空间订阅返回格式错误");
            })
            .catch((error) => {
                if (error) {
                    rej(error);
                }
            });
    });
}
async function testLatest() {
    log.info(await getLatestInfo());
}
function main() {
    // testDate();
    // testParser();
    testLatest();
}
main();
