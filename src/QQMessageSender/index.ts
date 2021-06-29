import log from "../Logger";
import wsClient from "../WebsocketHandler";
import config from "../../config/config.json";
import configExample from "../../config/template/config.json";
import { Config } from "./config.interface";
import EventEmitter from "events";
import { env } from "process";

class MessageSender {
    private wsc: wsClient;
    private e: EventEmitter;

    constructor() {
        this.e = new EventEmitter();
        this.e.on("qwq", (x) => {
            log.info(x);
        });
        let conf: Config;
        log.info(env.NODE_ENV);
        if (env.NODE_ENV === "production") {
            log.warn("使用Production配置");
            conf = config || configExample;
        } else if (env.NODE_ENV === "dev") {
            log.warn("使用Dev配置");
            conf = configExample;
        } else {
            log.warn("使用默认配置");
            conf = configExample;
        }

        this.wsc = new wsClient(
            conf.onebot_host,
            conf.onebot_port,
            this.e,
            "qwq"
        );
        this.wsc.connect();
        // TODO 等待初始化
    }

    public sendToGroup(groupId: number, msg: string): void {
        // TODO 过长的消息截断划分，不能截断带转义的部分
        this.wsc.sendMessage(
            JSON.stringify({
                action: "send_group_msg",
                params: {
                    group_id: groupId,
                    message: msg,
                },
            })
        );
    }
}
export default MessageSender;
