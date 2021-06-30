import log from "../Logger";
import wsClient from "../WebsocketHandler";
import config from "../../config/config.json";
import configExample from "../../config/template/config.json";
import { Config } from "./config.interface";
import EventEmitter from "events";
import { env } from "process";
import { messageEvent, responseEvent } from "./event.interface";
import command from "../QQCommand";
import dbm from "../DBHandler";

/**
 * It's time to say good bye,
 * I'm not afraid of you.
 * I need to walk away 'cause I don't wanna
 * be a liar.
 * If I can not live my life,
 * I am as good as dead.
 * 							____ 游戏王5D's OP2
 */

/**
 * 处理QQ消息通知
 * 分发QQ接收的指令
 */
class QQMessage {
    private wsc: wsClient;
    private e: EventEmitter;
    private cmd: command;
    private db = dbm;
    private static instance: QQMessage;

    constructor() {
        this.cmd = new command();
        this.e = new EventEmitter();
        this.e.on("qwq", (event) => {
            event = JSON.parse(event);
            if ((<responseEvent>event).status) {
                //api 响应结果
                switch ((<responseEvent>event).retcode) {
                    case 1400:
                        log.warn("api的请求400错误", event);
                        break;
                    case 1404:
                        log.warn("api的请求404错误", event);
                        break;
                    case 0:
                    default:
                        break;
                }
                return;
            } else if (
                (<messageEvent>event).post_type === "message" &&
                (<messageEvent>event).message_type === "group"
            ) {
                // 响应命令
                let ev = <messageEvent>event;
                if (this.cmd.dispatchCommand(ev, ev.message)) {
                    // 处理命令
                } else {
                    // 储存聊天
                    // log.debug(ev);
                    this.db
                        .insertSingle(
                            "group_msg",
                            ["group_id", "user_id", "msg", "time"],
                            [ev.group_id, ev.user_id, ev.message, ev.time]
                        )
                        .then((res) => {
                            if (res) {
                                log.debug("写入消息记录", ev.message_id);
                            }
                        })
                        .catch((rej) => {
                            if (rej) {
                                log.warn("消息记录写入失败");
                                log.warn(rej);
                            }
                        });
                }
            }
        });
        let conf: Config;
        log.info(env.NODE_ENV);
        if (env.NODE_ENV === "production") {
            log.warn("使用Production配置");
            if (typeof (<Config>(<unknown>config)).onebot_port === "number") {
                conf = config;
            } else {
                log.warn("配置不正确，改为使用默认配置运行");
                conf = configExample;
            }
        } else if (env.NODE_ENV === "dev") {
            log.warn("使用Dev配置");
            conf = configExample;
        } else {
            log.warn("使用默认配置");
            conf = configExample;
        }

        this.wsc = new wsClient(
            conf.onebot_host,
            conf.onebot_port as number,
            this.e,
            "qwq"
        );
        this.wsc.connect();
        // TODO 等待初始化
        process.on("exit", () => {
            this.wsc.close();
        });
    }
    public static getInstance() {
        this.instance || (this.instance = new QQMessage());
        return this.instance;
    }

    public sendToGroup(groupId: number, msg: string): void {
        // TODO 过长的消息截断划分，不能截断带转义的部分
        // TODO 分成多段需要保证先后顺序
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
export default QQMessage.getInstance();
