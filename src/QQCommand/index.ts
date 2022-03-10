import log from "../Logger";
import {messageEvent} from "../QQMessage/event.interface";
import {CmdType} from "./type";
import lodash from "lodash";

/**
 * Proselyte, the moment of Yuri's victory is upon us.
 * The era of epsilon is at hand.
 */

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

    public async loadCommands() {

    }
}

const cmdDispatcher = new CommandDispatcher();

export default cmdDispatcher;
