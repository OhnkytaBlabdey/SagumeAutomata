import log from "../../Logger";
import path from "path";
import fs from "fs/promises";
import qq from "../../QQMessage";
import url from "url";

class Random {
    public __ra3Joke: Array<string> = [];
    public __ra3JokeDir: string = "./data/joke";

    public getRandom(n: number, m: number) {
        return Math.floor(Math.random() * (m - n + 1) + n);
    }

    public getRandomIndex(len: number) {
        return this.getRandom(0, len - 1);
    }

    async getImgFromLocal(dir: string) {
        try {
            log.info("读取图片目录成功: " + dir);
            const data = (await fs.readdir(path.resolve(dir))).filter(i => !(/\.gitignore/.test(i)));
            return data ? data : [];
        } catch (e) {
            log.warn(e);
        }
    };

    async randomPic(group_id: number, list: Array<string>, dir: string) {
        if (list.length) {
            const index = this.getRandomIndex(list.length);
            const aPath = path.resolve(dir, list[index]);
            console.log(`[CQ:image,file=${aPath}]`);
            qq.sendToGroup(group_id, `[CQ:image,file=${url.pathToFileURL(aPath)}]`);
        } else {
            log.warn("您大概没有存放图片素材素材");
        }
    }

    async run() {
        this.__ra3Joke = await this.getImgFromLocal(this.__ra3JokeDir) as Array<string>;

    }
}

const random = new Random();

export default random;
