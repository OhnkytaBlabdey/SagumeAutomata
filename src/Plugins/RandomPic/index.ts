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
import requester from "../../Requester";
import {checkExists, writeFile} from "../../Util/FileHandler";

class RandomPic{
    static getRandom(n: number, m: number) {
        return sampler.integer(n, m);
    }

    static async getImgFromLocal(dir: string) {
        try {
            const readDir = promisify(fs.readdir);
            const list = await readDir(path.resolve("data/", dir));
            const data = list ? (list.filter(i => !(/\.gitignore/.test(i)))) : [];
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
        const fileList = (await this.getImgFromLocal(dirName)) as Array<string>;
        const nfList = fileList.filter((i) => {
            return dbList.findIndex(v => {
                return v.picName === i;
            }) < 0;
        });
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
                    log.info("发送: " + m);
                    qq.sendToGroup(ev.group_id, m);
                } else {
                    const aPath = path.resolve("data/", p);
                    const cqCode = `[CQ:image,file=${url.pathToFileURL(aPath)}]`;
                    let m = specialTxt.replace("{{image}}", cqCode);
                    log.info("发送: " + m);
                    qq.sendToGroup(ev.group_id, m);
                }
            } else {
                log.warn("您大概没有存放图片素材");
            }
        }
    }

    static async saveImg(ev: messageEvent, tableName: string, dirName: string) {
        let temp = ev.message.replace(/[\[|\]]/g, "").split(",");
        let urlIndex = temp.findIndex(i => /url/.test(i));
        let fileNameIndex = temp.findIndex(i => /file/.test(i));
        if (urlIndex > -1) {
            let u = temp[urlIndex].split("=")[1];
            let res;
            try {
                res = (await requester.get({
                    url: u,
                    params: {

                    }
                }, {
                    responseType: "arraybuffer"
                }));
                let data = res.data;
                let fileType = res.headers["content-type"].split("/")[1];
                let fileName = temp[fileNameIndex].split("=")[1].split(".")[0] + "." + fileType;
                try {
                    await writeFile(path.resolve("data/", dirName, fileName), data);
                    await dbHandler.insertPic(tableName, fileName, ev.sender?.user_id);
                    log.info("保存图片成功" + fileName);
                    qq.sendToGroup(ev.group_id, `上传成功：[CQ:image,file=${url.pathToFileURL(path.resolve("data/", dirName, fileName))}]\nUploader: ${ev.sender?.user_id}`);
                } catch (e) {
                    log.warn(e.message ? e.message : e);
                    qq.sendToGroup(ev.group_id, "上传图片失败");
                }
            } catch (e) {
                log.warn(e.message ? e.message : e);
                log.warn("下载图片失败: " + url);
                qq.sendToGroup(ev.group_id, "上传图片失败");
            }
        }
    }

    static genUploadPicHandler(tN: string, dirN: string, cN: string, auth: Array<number>) {
        let tableName = tN;
        let dirName = dirN;
        let cmdName = cN;
        let authID = auth;
        return async (ev: messageEvent) => {
            if (authID.findIndex((i) => i === ev.sender?.user_id) > -1) {
                let cqImageList = ev.message.match(/\[CQ:image.*\]/);
                if (cqImageList && cqImageList.length) {
                    //[CQ:image,file=80c2b55527aac6750f927aab20a5dd32.image,url=https://gchat.qpic.cn/gchatpic_new/738767136/4141567869-2651177397-80C2B55527AAC6750F927AAB20A5DD32/0?term=3,subType=0]
                    await this.saveImg(ev, tableName, dirName);
                } else {
                    await db.insertSingle(
                        "cmdQueue",
                        [
                            "uid",
                            "type",
                            "timestamp"
                        ],
                        [
                            ev.sender?.user_id,
                            cmdName,
                            new Date().getTime()
                        ]
                    );
                    qq.sendToGroup(ev.group_id, "请在五分钟以内上传图片");
                }
            }
        }
    }

    static genUploadPicCmd(pattern: string, cmdName: string, tN: string, dirN: string, auth: Array<number>) {
        return {
            cmdName,
            exec: this.genUploadPicHandler(tN, dirN, cmdName, auth),
            pattern: new RegExp(`^${pattern}`)
        }
    }

    static genNewestCmdHandler(tN: string, dN: string, template: string) {
        let tableName = tN;
        let dirName = dN;
        let messageTemplate = template;
        return async (ev: messageEvent) => {
            let res = db.__service.prepare(`select * from ${tableName} order by timestamp desc`).get();
            if (res) {
                const aPath = path.resolve("data/", dirName, res.picName);
                const cqCode = `[CQ:image,file=${url.pathToFileURL(aPath)}]`;
                let m = messageTemplate.replace("{{image}}", cqCode);
                qq.sendToGroup(ev.group_id, m);
            }
        }
    }

    static genNewestCmd(pattern: string, cmdName: string, tName: string, dirName: string, mT: string) {
        return {
            cmdName,
            pattern: new RegExp(`^${pattern}`),
            exec: this.genNewestCmdHandler(tName, dirName, mT)
        }
    }

    static genRandomPicCmd(pattern: string, cmdName: string, isSpecial: boolean, tN: string, dirN: string, mTemplate: string, special?: string, specialPicPath?: string): CmdType.Cmd {
        return {
            cmdName,
            exec: this.genRandomPicCmdHandler(isSpecial, tN, dirN, mTemplate, special, specialPicPath),
            pattern: new RegExp(`^${pattern}`)
        }
    }
}

export default RandomPic;
