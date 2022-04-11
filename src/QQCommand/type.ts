/* eslint-disable @typescript-eslint/no-namespace */
import { messageEvent } from "../QQMessage/event.interface";

export namespace CmdType {
    export interface Cmd {
        pattern: RegExp;
        cmdName: string;
        exec: (ev: messageEvent) => Promise<any>;
    }
}
