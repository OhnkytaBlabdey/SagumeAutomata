import Subscriber from "../Subscriber";
import req from "../../Requester";
import { JuejinType } from "./type";
import randomUA from "user-agents";
import log from "../../Logger";
import DBHandler from "../../DBHandler";
import qq from "../../QQMessage";
import scheduler from "node-schedule";

class JuejinDaily extends Subscriber {
    protected actionName = "";
    protected flagCol = "";
    protected tableName = "JuejinDaily";
    private __timer: NodeJS.Timeout | undefined;
    private __url =
        "https://api.juejin.cn/recommend_api/v1/article/recommend_cate_feed";
    private __frontEndId = "6809637767543259144";
    private __backEndId = "6809637769959178254";
    private __intelligentIdiotId = "6809637773935378440";
    private __androidId = "6809635626879549454";
    private __clientType = 6587;
    private __id_type = 2;
    private __limit = 3;
    private __sortType = 200;
    public __info: JuejinType.Info = {};

    private async __requestJuejinAPI(id: string): Promise<string> {
        const { data } = await req.post<JuejinType.Response>(
            this.__url,
            JSON.stringify({
                cate_id: id,
                client_type: this.__clientType,
                cursor: "0",
                id_type: this.__id_type,
                limit: this.__limit,
                sort_type: this.__sortType,
            }),
            {
                headers: {
                    "content-type": "application/json",
                    "user-agent": new randomUA().toString(),
                },
            }
        );
        if (!data.err_no) {
            return data.data
                .map(
                    (article, i) =>
                        `#${i}\n《${article.article_info.title}》\n${
                            article.article_info.brief_content
                        }...\n链接: https://juejin.cn/post/${
                            article.article_id
                        }\n标签: ${article.tags
                            .map((t) => `${t.tag_name}`)
                            .join("")}\n\n`
                )
                .join("-----------\n");
        } else {
            throw new Error(data.err_msg);
        }
    }

    public async __intervalHandler() {
        try {
            try {
                await this.getLatestInfo();
            } catch (e: any) {
                log.warn(e.message ? e.message : e);
            }
            const rec = await DBHandler.getJuejinSubscribe(this.tableName, 0);
            rec.forEach((group) => {
                for (const i in this.__info) {
                    qq.sendToGroup(
                        group.group_id,
                        `每日掘金文章推荐\n${i}:\n${this.__info[i]}`
                    );
                }
            });
        } catch (e: any) {
            log.warn(e.message ? e.message : e);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    close(): void {}

    async getLatestInfo(): Promise<any> {
        try {
            this.__info["FrontEnd"] = await this.__requestJuejinAPI(
                this.__frontEndId
            );
        } catch (e: any) {
            log.warn(e.message ? e.message : e);
            log.warn("请求前端文章失败");
        }
        try {
            this.__info["BackEnd"] = await this.__requestJuejinAPI(
                this.__backEndId
            );
        } catch (e: any) {
            log.warn(e.message ? e.message : e);
            log.warn("请求后端文章失败");
        }
        try {
            this.__info["IntelligentIdiot"] = await this.__requestJuejinAPI(
                this.__intelligentIdiotId
            );
        } catch (e: any) {
            log.warn(e.message ? e.message : e);
            log.warn("请求人工智能文章失败");
        }
        try {
            this.__info["Android"] = await this.__requestJuejinAPI(
                this.__androidId
            );
        } catch (e: any) {
            log.warn(e.message ? e.message : e);
            log.warn("请求安卓文章失败");
        }
    }

    async addSub(groupId: number) {
        const rec = await DBHandler.getJuejinSubscribeInfo(
            this.tableName,
            0,
            groupId
        );
        if (!rec.length) {
            await DBHandler.addJuejinSubscribe(this.tableName, groupId, 0);
            await qq.sendToGroupSync(groupId, "该群订阅掘金成功");
            for (const i in this.__info) {
                qq.sendToGroup(
                    groupId,
                    `每日掘金文章推荐\n${i}:\n${this.__info[i]}`
                );
            }
        } else {
            qq.sendToGroup(groupId, "该群已订阅掘金");
        }
    }

    async removeSub(groupId: number) {
        const rec = await DBHandler.getJuejinSubscribeInfo(
            this.tableName,
            0,
            groupId
        );
        if (rec.length) {
            await DBHandler.deleteJuejinSubscribeInfo(
                this.tableName,
                groupId,
                0
            );
            qq.sendToGroup(groupId, "该群取消订阅掘金成功");
        } else {
            qq.sendToGroup(groupId, "该群未订阅掘金");
        }
    }

    async run() {
        try {
            await this.getLatestInfo();
        } catch (e: any) {
            log.warn(e.message ? e.message : e);
        }
        scheduler.scheduleJob(
            "30 30 6 * * *",
            this.__intervalHandler.bind(this)
        );
    }
}

const juejinDaily = new JuejinDaily();

export default juejinDaily;
