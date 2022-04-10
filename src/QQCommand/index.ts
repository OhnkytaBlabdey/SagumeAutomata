import log from "../Logger";
import {messageEvent} from "../QQMessage/event.interface";
import {CmdType} from "./type";
import lodash from "lodash";
import config from "../commands.config";
import {PluginLoaderType} from "../PluginLoader/type";
import {readFile} from "../Util/FileHandler";
import path from "path";
import {RandomPicType} from "../Plugins/RandomPic/type";
import RandomPic from "../Plugins/RandomPic";

/**
 * Proselyte, the moment of Yuri's victory is upon us.
 * The era of epsilon is at hand.
 */

function *iteConfig(configs: Array<PluginLoaderType.PluginConfig>) {
    for (let i of configs) {
        yield i;
    }
}

export class CommandDispatcher {
    private commands: Array<CmdType.Cmd>;

    constructor() {
        this.commands = [];
    }

    public async dispatchCommand(
        ev: messageEvent,
        msg: string
    ): Promise<boolean> {
        return new Promise(async (res, rej) => {
            try {
                const index = lodash.findIndex(this.commands, (i) => i.pattern.test(msg));
                if(index > -1) {
                    await this.commands[index].exec(ev);
                    res(true);
                }
            } catch (e) {
                rej(e);
            } finally {
                res(false);
            }
        });
    }

    async registerCmd() {
        const len = config.commands.length;
        const confGen = iteConfig(config.commands);
        log.info("开始注册命令...");
        for (let i = 0; i < len; i++) {
            const conf = confGen.next().value;
            if (conf && conf.hasOwnProperty("name") && conf.hasOwnProperty("on")) {
                if (conf.on) {
                    const cmd = (await import(`./command/${conf.name}`)).default;
                    log.info("加载命令: ", conf.name);
                    this.commands.push(cmd);
                } else {
                    log.info("不加载命令: ", conf.name);
                }
            } else {
                log.warn("非法的命令配置", conf);
            }
        }
    }

    public async loadRandomPicCommand() {
        let confS;
        let conf: Array<RandomPicType.RandomPicConf>;
        try {
            confS = (await readFile(path.resolve("randomPicCmdTemplate.config.json"))).data;
        } catch (e) {
            log.warn(e);
            log.warn("读取随机图片配置失败");
            return;
        }
        try {
            conf = JSON.parse(confS) as unknown as Array<RandomPicType.RandomPicConf>;
        } catch (e) {
            log.warn(e);
            log.warn("无法解析JSON文件");
            return;
        }
        for(let c of conf) {
            if (this.validateRandomPicConf(c)) {
                await RandomPic.initTemplateCmd(c.tableName, c.dirName);
                let cmd;
                if (!c.allowSpecial) {
                    cmd = RandomPic.genRandomPicCmd(
                        c.cmdPattern,
                        c.cmdPattern,
                        c.allowSpecial,
                        c.tableName,
                        c.dirName,
                        c.messageTemplate
                    );
                } else {
                    cmd = RandomPic.genRandomPicCmd(
                        c.cmdPattern,
                        c.cmdPattern,
                        c.allowSpecial,
                        c.tableName,
                        c.dirName,
                        c.messageTemplate,
                        c.special,
                        c.specialPicPath
                    );
                }
                this.commands.push(cmd);
            } else {
                log.warn("非法的命令配置");
            }
        }
    }

    public validateRandomPicConf(c: RandomPicType.RandomPicConf) {
        const check = (c: RandomPicType.RandomPicConf) => (
            c.hasOwnProperty("cmdPattern") &&
            c.hasOwnProperty("dirName") &&
            c.hasOwnProperty("tableName") &&
            c.hasOwnProperty("allowUpload") &&
            c.hasOwnProperty("allowSpecial") &&
            c.hasOwnProperty("messageTemplate"));
        const checkUpload = (c: RandomPicType.RandomPicConf) => (c.hasOwnProperty("newestCmdPattern") && c.hasOwnProperty("uploadCmdPattern") && c.hasOwnProperty("uploadCmdAuthID") && Array.isArray(c.uploadCmdAuthID));
        const checkSpecial = (c: RandomPicType.RandomPicConf) => (c.hasOwnProperty("special") && c.hasOwnProperty("specialPicPath"));
        if (check(c)) {
            if (!c.allowUpload && !c.allowSpecial) {
                return true;
            } else if (c.allowUpload && !c.allowSpecial) {
                return checkUpload(c);
            } else if (!c.allowUpload && c.allowSpecial) {
                return checkSpecial(c);
            } else {
                return checkUpload(c) && checkSpecial(c);
            }
        }
        return false;
    }

    public async loadCommand() {
        await this.registerCmd();
        log.info("开始注册模板命令...");
        await this.loadRandomPicCommand();
    }
}

const cmdDispatcher = new CommandDispatcher();
console.log(cmdDispatcher);

export default cmdDispatcher;
