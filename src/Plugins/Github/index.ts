import randomUA from "user-agents";
import log from "../../Logger";
import DBHandler from "../../DBHandler";
import qq from "../../QQMessage";
import scheduler from "node-schedule";
import Subscriber from "../Subscriber";
import req from "../../Requester";
import {GithubType} from "./type";

function *ite() {

}

class GithubSubscriber extends Subscriber {
    protected actionName: string = "";
    protected flagCol: string = "";
    protected tableName: string = "JuejinDaily";
    private __url: string = "https://trendings.herokuapp.com/repo";
    private __lang: Array<string> = ["javascript", "python", "java", "kotlin"];
    private __info: GithubType.Info = {};

    close(): void {

    }

    private async __requestGithubTrending(lang: string) {
        let {data}: {data: GithubType.Response} = await req.get({
            url: this.__url,
            params: {
                lang: lang
            }
        });
        if (data && data.msg === "suc") {
            return {
                data,
                lang
            }
        } else {
            throw new Error(data.msg);
        }
    }

    async getLatestInfo() {
        const task = this.__lang.map(l => this.__requestGithubTrending(l));
        const res = (await Promise.all(task)).map(res => {
            console.info(res);
            res.data.items.splice(5, res.data.items.length - 1);
            return {
                lang: res.lang,
                info: res.data.items.map(repo => `仓库：${repo.repo}\n简介：${repo.desc}\n链接: ${repo.repo_link}\n语言: ${res.lang}\nFork: ${repo.forks} Star: ${repo.stars}\n`).join("-----------\n")
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
            try {
                await this.getLatestInfo();
            } catch (e) {
                log.warn(e);
            }
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
        try {
            await this.getLatestInfo();
        } catch (e) {
            log.warn(e);
        }
        scheduler.scheduleJob("30 0 7 * * *",this.__intervalHandler.bind(this));
    }

}

const github = new GithubSubscriber();

export default github;
