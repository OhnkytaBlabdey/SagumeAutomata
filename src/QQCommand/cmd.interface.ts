import { messageEvent } from "../QQMessage/event.interface";

export interface cmdHandler {
    (ev: messageEvent): void;
}

export interface Cmd {
    pattern: RegExp;
    cmdName: string;
}

export interface CmdRegisterArgs extends Cmd{
    keyword: string;
    exec: cmdHandler;
}
