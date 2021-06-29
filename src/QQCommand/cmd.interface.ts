import { messageEvent } from "../QQMessage/event.interface";

export interface cmdHandler {
    (ev: messageEvent, args: any[]): void;
}

export interface cmd {
    pattern: RegExp;
    exec: cmdHandler;
}
