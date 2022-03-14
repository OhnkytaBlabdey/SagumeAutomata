import Subscriber from "../Subscriber";
import req from "../../Requester";
import {JuejinType} from "./type";
import randomUA from "user-agents";
import log from "../../Logger";
import DBHandler from "../../DBHandler";
import qq from "../../QQMessage";

class JuejinDaily extends Subscriber {
    protected actionName: string = "";
    protected flagCol: string = "";
    protected tableName: string = "JuejinDaily";
    private __timer: NodeJS.Timeout | undefined;
    private __url: string = "https://api.juejin.cn/recommend_api/v1/article/recommend_cate_feed";
    private __frontEndId: string = "6809637767543259144";
    private __backEndId: string = "6809637769959178254";
    private __intelligentIdiotId: string = "6809637773935378440";
    private __androidId: string = "6809635626879549454";
    private __clientType: number = 6587;
    private __id_type: number = 2;
    private __limit: number = 5;
    private __sortType: number = 200;
    public __info: JuejinType.Info = {};

    private async __requestJuejinAPI(id: string): Promise<string> {
        const {data} = await req.post<JuejinType.Response>(this.__url, JSON.stringify({
            cate_id: id,
            client_type: this.__clientType,
            cursor: "0",
            id_type: this.__id_type,
            limit: this.__limit,
            sort_type: this.__sortType
        }), {
            headers: {
                "content-type": "application/json",
                "user-agent": new randomUA().toString()
            }
        });
        if (!data.err_no) {
            return data.data.map(((article, i) => (
                `#${i}\n《${article.article_info.title}》\n${article.article_info.brief_content}...\n链接: https://juejin.cn/post/${article.article_id}\n标签: ${article.tags.map(t => `${t.tag_name}`).join("")}\n\n`
            ))).join("");
        } else {
            throw new Error(data.err_msg);
        }
    }

    public async __intervalHandler() {
        try {
            await this.getLatestInfo();
            const rec = await DBHandler.getJuejinSubscribe(this.tableName, 0);
            console.log(rec);
            rec.forEach(group => {
                qq.sendToGroup(group.group_id, "每日掘金文章推荐");
                for (let i in this.__info) {
                    qq.sendToGroup(group.group_id, `${i}:\n${this.__info[i]}`);
                }
            });
        } catch (e) {
            log.warn(e);
        }
    }

    close(): void {

    }

    async getLatestInfo(): Promise<any> {
        try {
            this.__info["FrontEnd"] = await this.__requestJuejinAPI(this.__frontEndId);
        } catch (e) {
            log.warn(e);
            log.warn("请求前端文章失败");
        }
        try {
            this.__info["BackEnd"] = await this.__requestJuejinAPI(this.__backEndId);
        } catch (e) {
            log.warn(e);
            log.warn("请求后端文章失败");
        }
        try {
            this.__info["IntelligentIdiot"] = await this.__requestJuejinAPI(this.__intelligentIdiotId);
        } catch (e) {
            log.warn(e);
            log.warn("请求人工智能文章失败");
        }
        try {
            this.__info["Android"] = await this.__requestJuejinAPI(this.__androidId);
        } catch (e) {
            log.warn(e);
            log.warn("请求安卓文章失败");
        }
        log.info(this.__info);
    }

    async addSub(groupId: number) {
        const rec = await DBHandler.getJuejinSubscribeInfo(this.tableName, 0, groupId);
        if (!rec.length) {
            await DBHandler.addJuejinSubscribe(this.tableName, groupId, 0);
            await qq.sendToGroupSync(groupId, `该群订阅掘金成功`);
            for (let i in this.__info) {
                qq.sendToGroup(groupId, `${i}:\n${this.__info[i]}`);
            }
        } else {
            qq.sendToGroup(groupId, `该群已订阅掘金`);
        }
    }

    async removeSub(groupId: number) {
        const rec = await DBHandler.getJuejinSubscribeInfo(this.tableName, 0, groupId);
        if (rec.length) {
            await DBHandler.deleteJuejinSubscribeInfo(this.tableName, groupId, 0);
            await qq.sendToGroupSync(groupId, `该群取消订阅掘金成功`);
        } else {
            qq.sendToGroup(groupId, `该群未订阅掘金`);
        }
    }

    async run() {
        await this.getLatestInfo();
        this.__timer = setInterval(this.__intervalHandler, 1000 * 60 * 60 * 24);
    }
}

const juejinDaily = new JuejinDaily();

export default juejinDaily;
