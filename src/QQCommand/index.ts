import log from "../Logger";
import { messageEvent } from "../QQMessage/event.interface";
import { CmdType } from "./type";
import lodash from "lodash";
import config from "../commands.config";
import { PluginLoaderType } from "../PluginLoader/type";
import { readFile } from "../Util/fileHandler";
import path from "path";
import { RandomPicType } from "../Plugins/RandomPic/type";
import RandomPic from "../Plugins/RandomPic";
import {CommandConfigType} from "../ConfigHandler/interface";

/**
 * Proselyte, the moment of Yuri's victory is upon us.
 * The era of epsilon is at hand.
 */

function* iteConfig(configs: Array<PluginLoaderType.PluginConfig>) {
    for (const i of configs) {
        yield i;
    }
}

export class CommandDispatcher {
    private commands: Array<CmdType.Cmd>;
    public randomImgConf: Array<RandomPicType.RandomPicConf>;

    constructor() {
        this.commands = [];
        this.randomImgConf = [];
    }

    public async dispatchCommand(
        ev: messageEvent,
        msg: string
    ): Promise<boolean> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (res, rej) => {
            try {
                const index = lodash.findIndex(this.commands, (i) =>
                    i.pattern.test(msg)
                );
                if (index > -1) {
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

    async registerCmd(commands: Array<CommandConfigType>) {
        const len = commands.length;
        const confGen = iteConfig(commands);
        for (let i = 0; i < len; i++) {
            const conf = confGen.next().value;
            if (
                conf &&
                Object.prototype.hasOwnProperty.call(conf,"name") &&
                Object.prototype.hasOwnProperty.call(conf, "on")
            ) {
                if (conf.on) {
                    const cmd = (await import(`./command/${conf.name}`))
                        .default;
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

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public async loadRandomPicCommand() {
        let confS;
        let conf: Array<RandomPicType.RandomPicConf>;
        try {
            confS = (
                await readFile(path.resolve("randomPicCmdTemplate.config.json"))
            ).data;
        } catch (e) {
            log.warn(e);
            log.warn("读取随机图片配置失败");
            return;
        }
        try {
            conf = JSON.parse(
                confS
            ) as unknown as Array<RandomPicType.RandomPicConf>;
        } catch (e) {
            log.warn(e);
            log.warn("无法解析JSON文件");
            return;
        }
        for (const c of conf) {
            if (this.validateRandomPicConf(c)) {
                this.randomImgConf.push(c);
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
                log.info(`加载命令: ${cmd.cmdName}`);
                this.commands.push(cmd);
                if (c.allowUpload) {
                    const uploadCmd = RandomPic.genUploadPicCmd(
                        c.uploadCmdPattern as string,
                        c.uploadCmdPattern as string,
                        c.tableName,
                        c.dirName,
                        c.uploadCmdAuthID as Array<number>
                    );
                    this.commands.push(uploadCmd);
                    const newestCmd = RandomPic.genNewestCmd(
                        c.newestCmdPattern as string,
                        c.newestCmdPattern as string,
                        c.tableName,
                        c.dirName,
                        c.messageTemplate
                    );
                    this.commands.push(newestCmd);
                }
            } else {
                log.warn("非法的命令配置");
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public validateRandomPicConf(c: RandomPicType.RandomPicConf) {
        const check = (c: RandomPicType.RandomPicConf) =>
            Object.prototype.hasOwnProperty.call(c, "cmdPattern") &&
            Object.prototype.hasOwnProperty.call(c, "dirName") &&
            Object.prototype.hasOwnProperty.call(c, "tableName") &&
            Object.prototype.hasOwnProperty.call(c, "allowUpload") &&
            Object.prototype.hasOwnProperty.call(c, "allowSpecial") &&
            Object.prototype.hasOwnProperty.call(c, "messageTemplate");
        const checkUpload = (c: RandomPicType.RandomPicConf) =>
            Object.prototype.hasOwnProperty.call(c, "newestCmdPattern") &&
            Object.prototype.hasOwnProperty.call(c, "uploadCmdPattern") &&
            Object.prototype.hasOwnProperty.call(c, "uploadCmdAuthID") &&
            Array.isArray(c.uploadCmdAuthID);
        const checkSpecial = (c: RandomPicType.RandomPicConf) =>
            Object.prototype.hasOwnProperty.call(c, "special") && Object.prototype.hasOwnProperty.call(c, "specialPicPath");
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

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public async loadTemplateCommand() {
        log.info("开始注册模板命令...");
        await this.loadRandomPicCommand();
    }
}

const cmdDispatcher = new CommandDispatcher();

export default cmdDispatcher;
