import log from "../Logger";
import { messageEvent } from "../QQMessage/event.interface";
import { CmdType } from "./type";
import lodash from "lodash";
import { PluginLoaderType } from "../PluginLoader/type";
import {readFile, writeFile} from "../Util/fileHandler";
import path from "path";
import {
    CommandConfigType,
    latestTemplateType,
    messageTemplateType,
    templateConfType,
    uploadTemplateType
} from "../ConfigHandler/interface";
import configHandler from "../ConfigHandler";
import {
    genLatestTemplateCmdHandler,
    genMessageTemplateCmdHandler,
    genUploadTemplateCmdHandler,
    saveImg
} from "../Plugins/TemplateMessage";
import {checkExists, mkdir} from "../Util/fileHandler";
import qq from "../QQMessage";

/**
 * Proselyte, the moment of Yuri's victory is upon us.
 * The era of epsilon is at hand.
 */

function* iteConfig(configs: Array<PluginLoaderType.PluginConfig> | Array<templateConfType>) {
    for (const i of configs) {
        yield i;
    }
}

export class CommandDispatcher {
    private commands: Array<CmdType.Cmd>;
    private tasks: Array<CmdType.Task>;

    constructor() {
        this.commands = [];
        this.tasks = [];
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
                } else {
                    res(false);
                }
            } catch (e) {
                log.warn("匹配命令时出现错误");
                log.warn(e);
                res(false);
            }
        });
    }

    async registerCmd(commands: Array<CommandConfigType>) {
        const len = commands.length;
        const confGen = iteConfig(commands);
        for (let i = 0; i < len; i++) {
            const conf = confGen.next().value as CommandConfigType;
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

    public async loadIntervalTemplateMessageCommand(): Promise<void> {

    }

    public async loadTemplateMessageCommand(): Promise<void> {
        const conf = configHandler.getTemplateConfig();
        const ite = iteConfig(conf);
        for(let i = 0; i < conf.length; ++i) {
            let c = ite.next().value as templateConfType;
            try {
                if (Object.prototype.hasOwnProperty.call(c, "dir") && (c.dir as string).length > 0) {
                    if(!(await checkExists(path.resolve("data/", c.dir as string))).status) {
                        log.info(`文件夹${c.dir}不存在，将创建`);
                        await mkdir(path.resolve("data/", c.dir as string));
                    }
                    log.info(`文件夹${c.dir}存在`);
                }
                if(c.type === "message") {
                    const cmd = genMessageTemplateCmdHandler(c.cmdName, c.cmdName, (<messageTemplateType>c).template, c.cd,c.dir ? c.dir : "");
                    log.info(`加载命令: ${cmd.cmdName}`);
                    this.commands.push(cmd);
                } else if(c.type === "latest") {
                    const cmd = genLatestTemplateCmdHandler(c.cmdName, c.cmdName, (<latestTemplateType>c).template, c.dir as string);
                    log.info(`加载命令: ${cmd.cmdName}`);
                    this.commands.push(cmd);
                } else if(c.type === "upload") {
                    const cmd = genUploadTemplateCmdHandler(c.cmdName, c.cmdName, (<uploadTemplateType>c).dir, (<uploadTemplateType>c).preMessage, (<uploadTemplateType>c).authID, (<uploadTemplateType>c).id);
                    log.info(`加载命令: ${cmd.cmdName}`);
                    this.commands.push(cmd);
                }
            } catch (e) {
                log.warn(e);
                log.warn("加载模板配置失败");
            }
        }
    }

    // 上传图片任务队列
    async handleTasks(ev: messageEvent): Promise<boolean> {
        if(/^\[CQ:image.*\]$/.test(ev.message)) {
            const groupID = ev.group_id;
            const userID = ev.sender?.user_id;
            const time = new Date().getTime();
            const targetIndex = this.tasks.findIndex(t => {
                return t.userID === userID && t.groupID === groupID && (time - t.enqueueTime < t.expire);
            });
            if (targetIndex > -1) {
                const task = this.tasks.splice(targetIndex, 1)[0];
                const fileName = `${time / 1000}_${userID}`;
                const res = await saveImg(ev, fileName, task.dir);
                if(res) {
                    qq.sendToGroup(
                        ev.group_id,
                        `上传成功`);
                    return true;
                }
                qq.sendToGroup(ev.group_id, "上传图片失败");
            }
        }
        return false;
    }

    addTask(t: CmdType.Task): void {
        this.tasks.push(t);
    }

    public async loadTemplateCommand(): Promise<void>  {
        log.info("开始注册模板命令...");
        // await this.loadRandomPicCommand();
        await this.loadTemplateMessageCommand();
    }
}

const cmdDispatcher = new CommandDispatcher();

export default cmdDispatcher;
