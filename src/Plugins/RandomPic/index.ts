import log from "../../Logger";
import path from "path";
import fs from "fs";
import {promisify} from "util";
import db from "../../DBManager";
import dbHandler from "../../DBHandler";
import sampler from "../../Util/sampler";
import {CmdType} from "../../QQCommand/type";
import { messageEvent } from "../../QQMessage/event.interface";
import {RandomPicType} from "./type";
import qq from "../../QQMessage";
import url from "url";
import {checkExists} from "../../Util/FileHandler";

class RandomPic{
    static getRandom(n: number, m: number) {
        return sampler.integer(n, m);
    }

    static async getImgFromLocal(dir: string) {
        try {
            const readDir = promisify(fs.readdir);
            const list = await readDir(path.resolve("data/", dir));
            log.info(list);
            const data = list ? (list.filter(i => !(/\.gitignore/.test(i)))) : [];
            console.log("读取图片数量: " + data && data.length);
            return data ? data : [];
        } catch (e) {
            log.warn(e);
            return [];
        }
    };

    static async initTemplateCmd(tName: string, dirName: string) {
        let isTableExist = await dbHandler.checkIfDBTable(tName);
        let isDirExist = (await checkExists(path.resolve("data/", dirName))).status;
        if (!isDirExist || !isTableExist) {
            if (!isDirExist) {
                const mkdir = promisify(fs.mkdir);
                await mkdir(path.resolve("data/", dirName));
            }
            if (!isTableExist) {
                await dbHandler.createRandomPicTable(tName);
            }
        }
        const dbList = await db.select(
            [tName],
            ["*"],
            [],
            true
        ) as Array<RandomPicType.RandomPicDBRes>;
        log.info(dbList);
        const fileList = (await this.getImgFromLocal(dirName)) as Array<string>;
        log.info(fileList);
        const nfList = fileList.filter((i) => {
            return dbList.findIndex(v => {
                return v.picName === i;
            }) < 0;
        });
        log.info(nfList);
        await dbHandler.insertPicWhileInit(tName, nfList);
    }

    static genRandomPicCmdHandler(isSpecial: boolean, tN: string, dirN: string, mTemplate: string, special?: string, specialPicPath?: string) {
        let toggleSpecial = isSpecial;
        let specialTxt = special ? special : "";
        let p = specialPicPath ? specialPicPath : "";
        let dirName = dirN;
        let tName = tN;
        let messageTemplate = mTemplate;
        return async (ev: messageEvent) => {
            let list = (await db.select(
                [tName],
                ["*"],
                [],
                true
            )) as Array<RandomPicType.RandomPicDBRes>;
            if (list.length) {
                let i = this.getRandom(0, toggleSpecial ? list.length : list.length - 1);
                if (i < list.length) {
                    const aPath = path.resolve("data/", dirName, list[i].picName);
                    const cqCode = `[CQ:image,file=${url.pathToFileURL(aPath)}]`;
                    let m = messageTemplate.replace("{{image}}", cqCode);
                    qq.sendToGroup(ev.group_id, m);
                } else {
                    const aPath = path.resolve("data/", p);
                    const cqCode = `[CQ:image,file=${url.pathToFileURL(aPath)}]`;
                    let m = specialTxt.replace("{{image}}", cqCode);
                    qq.sendToGroup(ev.group_id, m);
                }
            } else {
                log.warn("您大概没有存放图片素材");
            }
        }
    }

    static genRandomPicCmd(pattern: string, cmdName: string, isSpecial: boolean, tN: string, dirN: string, mTemplate: string, special?: string, specialPicPath?: string): CmdType.Cmd {
        return {
            cmdName,
            exec: this.genRandomPicCmdHandler(isSpecial, tN, dirN, mTemplate, special, specialPicPath),
            pattern: new RegExp(pattern)
        }
    }
}

export default RandomPic;
