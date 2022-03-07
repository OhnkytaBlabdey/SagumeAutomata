import log from "../Logger";
import { messageEvent } from "../QQMessage/event.interface";
import {Cmd, CmdRegisterArgs} from "./cmd.interface";
import EventEmitter from "events";
import process from "process";
import {msgFilter} from "../Util/msgFilter";

/**
 * Proselyte, the moment of Yuri's victory is upon us.
 * The era of epsilon is at hand.
 */

export class CommandDispatcher {
    private commands: Map<string, Cmd>;
    private cmdEventListener: EventEmitter;
    private static instance: CommandDispatcher | null;
    constructor() {
        this.commands = new Map<string, Cmd>();
        this.cmdEventListener = new EventEmitter();
        this.cmdEventListener.on("error", (err) => {
            log.error(err);
        });
        process.on("exit", () => {
            this.cmdEventListener.removeAllListeners();
        });
    }

    public static getInstance() {
        this.instance || (this.instance = new CommandDispatcher());
        return this.instance;
    }

    /**
     * 注册命令
     * @param cmdName
     * @param pattern
     * @param exec
     * @param keyword: 根据keyword检查对应命令，在map中命中则使用对用Command的pattern判断合法性
     */
    public registerCommand({cmdName, pattern, exec, keyword}: CmdRegisterArgs): void {
        let command: Cmd = {
            pattern,
            cmdName
        }
        this.cmdEventListener.on(cmdName, exec);
        this.commands.set(keyword, command);
    }

    /**
     * 首先检查是否有对应关键字
     * 然后检查命令是否合法
     * @param ev
     * @param msg
     */
    public dispatchCommand(ev: messageEvent, msg: string): boolean{
        let keyword = msgFilter(msg);
        try {
            if (this.commands.has(keyword)) {
                let cmd = this.commands.get(keyword) as Cmd;
                if (cmd.pattern.test(msg)) {
                    this.cmdEventListener.emit(cmd.cmdName, ev);
                    return true;
                } else {
                    log.error(`${msg} 命令不合法`);
                }
            }
        } catch (e) {
            log.error(e);
        }
        return false;
    }
}

export const cmdDispatcher = CommandDispatcher.getInstance();
