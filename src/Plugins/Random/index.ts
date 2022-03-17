import log from "../../Logger";
import path from "path";
import fs from "fs/promises";
import qq from "../../QQMessage";
import url from "url";
import sampler from "../../Util/sampler";

class Random {
    public __ra3Joke: Array<string> = [];
    public __ra3JokeDir: string = "./data/joke";
    public __moTalk: Array<string> = [];
    public __moTalkDir: string = "./data/mo_talk";
    public __saschaTalk: Array<string> = [];
    public __saschaTalkDir: string = "./data/sascha_talk";

    public getRandom(n: number, m: number) {
        return sampler.integer(n, m);
    }

    public getRandomIndex(len: number) {
        return this.getRandom(0, len);
    }

    async getImgFromLocal(dir: string) {
        try {
            log.info("读取图片目录成功: " + dir);
            const data = (await fs.readdir(path.resolve(dir))).filter(i => !(/\.gitignore/.test(i)));
            console.log("读取图片数量: " + data && data.length);
            return data ? data : [];
        } catch (e) {
            log.warn(e);
        }
    };

    generateExtraMsg(type: string, cqCode: string, isSpecial = false) {
        switch (type) {
        case "mo_talk":
            if (isSpecial) {
                return "你来到了宇宙的尽头\n在世界的尽头的尽头你发现了一个黄色可疑建筑\n" + cqCode;
            }
            return "墨曰:\n" + cqCode;
        case "sascha_talk":
            if (isSpecial) {
                return "你来到了卡巴那岛的森林里\n你发现了一把插在石头里的电锯，上面挂着一根猫尾巴\n传说拥有它就拥有了号令群友发涩图的力量" + cqCode;
            }
            return "莎皇诏曰:\n" + cqCode;
        default:
            return "" + cqCode;
        }
    }



    async randomPic(group_id: number, list: Array<string>, dir: string, type = "default") {
        if (list.length) {
            if (type !== "default") {
                const index = this.getRandomIndex(list.length);
                if (index < list.length) {
                    const aPath = path.resolve(dir, list[index]);
                    const cqCode = `[CQ:image,file=${url.pathToFileURL(aPath)}]`;
                    qq.sendToGroup(group_id, `${this.generateExtraMsg(type, cqCode)}\n`);
                } else {
                    const aPath = path.resolve("../", dir, `${type}.png`);
                    const cqCode = `[CQ:image,file=${url.pathToFileURL(aPath)}]`;
                    qq.sendToGroup(group_id, `${this.generateExtraMsg(type, cqCode, true)}\n`);
                }
            } else {
                const index = this.getRandomIndex(list.length - 1);
                const aPath = path.resolve(dir, list[index]);
                const cqCode = `[CQ:image,file=${url.pathToFileURL(aPath)}]`;
                qq.sendToGroup(group_id, `${this.generateExtraMsg(type, cqCode)}\n`);
            }
        } else {
            log.warn("您大概没有存放图片素材素材");
        }
    }

    async run() {
        this.__ra3Joke = await this.getImgFromLocal(this.__ra3JokeDir) as Array<string>;
        this.__moTalk = await this.getImgFromLocal(this.__moTalkDir) as Array<string>;
        this.__saschaTalk = await this.getImgFromLocal(this.__saschaTalkDir) as Array<string>;
    }
}

const random = new Random();

export default random;
