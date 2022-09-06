import fileList from "./file.config";
import { CheckerType } from "./type";
import log from "../Logger";
import { checkExists, writeFile } from "../Util/FileHandler";
import path from "path";
import {promisify} from "util";
import {mkdir} from "fs";

function* iteGen(list: Array<CheckerType.CheckerSel>) {
    for (const i of list) {
        yield i;
    }
}

class Checker {
    static async checkComplicity() {
        const ite = iteGen(fileList);
        for (let i = 0; i < fileList.length; i++) {
            try {
                const file = ite.next().value as CheckerType.CheckerSel;
                const p = path.resolve(file.name);
                log.info(`检查${file.type === "file" ? "文件" : "目录"}: ${p}`);
                if (!(await checkExists(p)).status) {
                    log.info(`目标: ${p}不存在，将要创建目标项...`);
                    if (file.type === "file") {
                        await writeFile(p, JSON.stringify([]));
                    } else {
                        const mk = promisify(mkdir);
                        await mk(p);
                    }
                }
            } catch (e) {
                log.error(e);
            }
        }
    }
}

export default Checker;
