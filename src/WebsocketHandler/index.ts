import Websocket from "ws";
import EventEmitter from "events";
import logger from "../Logger";
import process from "process";

class WebsocketHandler extends EventEmitter {
    private __port: number;
    private __host: string;
    private __wsClient;
    private __eventListener: EventEmitter;
    private __eventTarget: string;

    constructor(host: string, port: number, eventListener: EventEmitter, eventTarget: string) {
        super();
        this.__port = port;
        this.__host = host;
        this.__eventListener = eventListener;
        this.__eventTarget = eventTarget;
        this.__wsClient = new Websocket(`${this.__host}:${this.__port}`);
        this.__wsClient.on("open", () => {
            logger.info("已建立连接");
        });
        this.__wsClient.on("error", (e) => {
            logger.error("连接发生错误");
            logger.error(e);
        });
        this.__wsClient.on("message", (data) => {
            logger.info("接收到来自服务端消息");
            this.__eventListener.emit(this.__eventTarget, data);
        });
        process.on("exit", () => {
            this.__wsClient.close();
        });
    }

    close() {
        this.__wsClient.close();
    }

    sendMessage(data: string) {
        try {
            this.__wsClient.send(data);
        } catch (e) {
            throw e;
        }
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
