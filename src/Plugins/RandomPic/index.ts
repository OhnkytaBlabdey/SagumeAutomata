import log from "../../Logger";
import path from "path";
import qq from "../../QQMessage";
import url from "url";
import sampler from "../../Util/sampler";
import fs from "fs";
import {promisify} from "util";
import db from "../../DBManager";

class RandomPic {
    public getRandom(n: number, m: number) {
        return sampler.integer(n, m);
    }
    async getImgFromLocal(dir: string) {
        try {
            log.info("读取图片目录成功: " + dir);
            const readDir = promisify(fs.readdir);
            const data = (await readDir(path.resolve(dir))).filter(i => !(/\.gitignore/.test(i)));
            console.log("读取图片数量: " + data && data.length);
            return data ? data : [];
        } catch (e) {
            log.warn(e);
        }
    };
    async checkDBTable(tName: string) {
        const tableInfo =
    }
}
