import log from "../Logger";
import {messageEvent} from "../QQMessage/event.interface";
import {CmdType} from "./type";
import lodash from "lodash";
import config from "../commands.config";
import {PluginLoaderType} from "../PluginLoader/type";

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

    public async loadCommand() {
        console.log(config.commands);
        const len = config.commands.length;
        const confGen = iteConfig(config.commands);
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
                log.warn("invalid command config", conf);
            }
        }
    }
}

const cmdDispatcher = new CommandDispatcher();

export default cmdDispatcher;
