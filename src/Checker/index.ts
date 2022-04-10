import fileList from "./file.config";
import {CheckerType} from "./type";
import log from "../Logger";
import {checkExists, writeFile} from "../Util/FileHandler";
import path from "path";

function *iteGen(list: Array<CheckerType.CheckerSel>) {
    for (let i of list) {
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
                    await writeFile(p, JSON.stringify([]));
                }
            } catch (e) {
                log.error(e);
            }
        }
    }
}

export default Checker;
