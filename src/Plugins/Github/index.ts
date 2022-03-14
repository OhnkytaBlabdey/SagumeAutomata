import randomUA from "user-agents";
import log from "../../Logger";
import DBHandler from "../../DBHandler";
import qq from "../../QQMessage";
import scheduler from "node-schedule";
import Subscriber from "../Subscriber";
import req from "../../Requester";
import {GithubType} from "./type";

class GithubSubscriber extends Subscriber {
    protected actionName: string = "";
    protected flagCol: string = "";
    protected tableName: string = "JuejinDaily";
    private __url: string = "https://e.juejin.cn/resources/github";
    private __limit: number = 3;
    private __category: string = "trending";
    private __period: string = "day";
    private __lang: Array<string> = ["javascript", "python", "java", "kotlin", "c++"];
    private __info: GithubType.Info = {};

    close(): void {

    }

    private async __requestGithubTrending(lang: string) {
        let {data} = await req.post<GithubType.Response>(this.__url, JSON.stringify({
            category: this.__category,
            lang: lang,
            limit: this.__limit,
            offset: 0,
            period: this.__period
        }));
        if (data.code === 200) {
            return {
                data,
                lang
            }
        } else {
            throw new Error("请求掘金Github的API时出现错误" + data.code);
        }
    }

    async getLatestInfo() {
        const task = this.__lang.map(l => this.__requestGithubTrending(l));
        const res = (await Promise.all(task)).map(res => {
            return {
                lang: res.lang,
                info: res.data.data.map(repo => `${repo.id}\n${repo.description}\n链接: ${repo.url}\n语言: ${repo.lang}\nFork: ${repo.forkCount} Star: ${repo.starCount}\n`).join("\n")
            }
        });
        for (let i of res) {
            this.__info[i.lang] = i.info;
        }
        log.info(this.__info);
    }

    async addSub(groupId: number) {
        const rec = await DBHandler.getJuejinSubscribeInfo(this.tableName, 1, groupId);
        if (!rec.length) {
            await DBHandler.addJuejinSubscribe(this.tableName, groupId, 1);
            await qq.sendToGroupSync(groupId, `该群订阅Github Trending成功`);
            for (let i in this.__info) {
                qq.sendToGroup(groupId, `Github Trending\n${i}:\n${this.__info[i]}`);
            }
        } else {
            qq.sendToGroup(groupId, `该群已订阅Github Trending`);
        }
    }

    async removeSub(groupId: number) {
        const rec = await DBHandler.getJuejinSubscribeInfo(this.tableName, 1, groupId);
        if (rec.length) {
            await DBHandler.deleteJuejinSubscribeInfo(this.tableName, groupId, 1);
            qq.sendToGroup(groupId, `该群取消订阅Github Trending成功`);
        } else {
            qq.sendToGroup(groupId, `该群未订阅Github Trending`);
        }
    }

    public async __intervalHandler() {
        try {
            await this.getLatestInfo();
            const rec = await DBHandler.getJuejinSubscribe(this.tableName, 1);
            console.log(rec);
            rec.forEach(group => {
                for (let i in this.__info) {
                    qq.sendToGroup(group.group_id, `Github Trending\n${i}:\n${this.__info[i]}`);
                }
            });
        } catch (e) {
            log.warn(e);
        }
    }

    async run() {
        await this.getLatestInfo();
        scheduler.scheduleJob("30 0 7 * * *",this.__intervalHandler);
    }

}

const github = new GithubSubscriber();

export default github;
