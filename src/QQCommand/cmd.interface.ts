import { messageEvent } from "../QQMessage/event.interface";

export interface cmdHandler {
    (ev: messageEvent): void;
}

export interface cmd {
    pattern: RegExp;
    exec: cmdHandler;
}
