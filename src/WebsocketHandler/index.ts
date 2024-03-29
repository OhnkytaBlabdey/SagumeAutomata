import Websocket from "ws";
import EventEmitter from "events";
import logger from "../Logger";
import process from "process";

class WebsocketHandler extends EventEmitter {
    private __port: number;
    private __host: string;

    private __wsClient!: Websocket;
    private __eventListener: EventEmitter;
    private __eventTarget: string;
    private __access_token: string;

    constructor(
        host: string,
        port: number,
        eventListener: EventEmitter,
        eventTarget: string,
        access_token: string
    ) {
        super();
        this.__port = port;
        this.__host = host;
        this.__eventListener = eventListener;
        this.__eventTarget = eventTarget;
        this.__access_token = access_token;
    }

    connect() {
        return new Promise((res, rej) => {
            if (this.__access_token && this.__access_token.length) {
                this.__wsClient = new Websocket(
                    `ws://${this.__host}:${this.__port}?access_token=${this.__access_token}`
                );
            } else {
                this.__wsClient = new Websocket(
                    `ws://${this.__host}:${this.__port}`
                );
            }

            this.__wsClient.on("open", () => {
                logger.info("ws已建立连接");
                res(1);
            });
            this.__wsClient.on("error", (e: any) => {
                logger.error("ws连接发生错误");
                rej(e);
            });
            this.__wsClient.on("message", (data: any) => {
                // logger.debug("ws接收到来自服务端消息");
                this.__eventListener.emit(this.__eventTarget, data);
            });
            process.on("exit", () => {
                this.__wsClient.close();
            });
        });
    }

    close() {
        this.__wsClient.close();
    }

    sendMessage(data: string) {
        this.__wsClient.send(data);
    }

    getEventListener(): EventEmitter {
        return this.__eventListener;
    }

    setEventListener(value: EventEmitter) {
        this.__eventListener = value;
    }

    getEventTarget(): string {
        return this.__eventTarget;
    }

    setEventTarget(value: string) {
        this.__eventTarget = value;
    }
}

export default WebsocketHandler;
