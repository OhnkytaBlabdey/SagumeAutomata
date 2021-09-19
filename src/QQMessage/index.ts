/* eslint-disable indent */
import log from "../Logger";
import wsClient from "../WebsocketHandler";
import config from "../../config/config.json";
import { Config } from "./config.interface";
import EventEmitter from "events";
import { env } from "process";
import { messageEvent, noticeEvent, responseEvent } from "./event.interface";
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
    private cnt = 0;
    protected qqid: number;
    private static instance: QQMessage;

    constructor() {
        this.cmd = new command();
        this.e = new EventEmitter();
        this.e.on("qwq", async (event: any) => {
            event = JSON.parse(event);
            if ((<responseEvent>event).status) {
                //api 响应结果
                switch ((<responseEvent>event).retcode) {
                    case 1400:
                        log.warn("api的请求400错误", event);
                        if ((<responseEvent>event).echo == null) {
                            return;
                        }
                        this.e.emit(
                            ((<responseEvent>event).echo as number).toString(),
                            event
                        );
                        break;
                    case 1404:
                        log.warn("api的请求404错误", event);
                        if ((<responseEvent>event).echo == null) {
                            return;
                        }
                        this.e.emit(
                            ((<responseEvent>event).echo as number).toString(),
                            event
                        );
                        break;
                    case 0:
                        //api调用正常
                        if ((<responseEvent>event).echo == null) {
                            return;
                        }
                        this.e.emit(
                            ((<responseEvent>event).echo as number).toString(),
                            event
                        );
                        break;
                    case 103:
                        if ((<responseEvent>event).echo == null) {
                            return;
                        }
                        this.e.emit(
                            ((<responseEvent>event).echo as number).toString(),
                            event
                        );
                        break;
                    default:
                        log.warn("未知的retcode");
                        log.warn(event);
                        break;
                }
                return;
            } else if (
                (<messageEvent>event).post_type === "message" &&
                (<messageEvent>event).message_type === "group"
            ) {
                // 响应命令
                const ev = <messageEvent>event;
                if (await this.cmd.dispatchCommand(ev, ev.message)) {
                    // 处理命令
                } else {
                    // 储存聊天
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
            } else if (
                (<noticeEvent>event).post_type === "notice" &&
                (<noticeEvent>event).notice_type === "notify"
            ) {
                if ((<noticeEvent>event).sub_type === "poke") {
                    //戳一戳
                    if (
                        (<noticeEvent>event).target_id === (<Config>config).qq
                    ) {
                        //被戳
                        log.debug("被戳了", JSON.stringify(event));
                        this.sendToGroupSync(
                            (<noticeEvent>event).group_id,
                            `[CQ:poke, qq=${(<noticeEvent>event).user_id}]`
                        );
                    }
                }
            }
        });
        let conf: Config;
        log.info(env.NODE_ENV);
        if (env.NODE_ENV === "production") {
            log.warn("使用Production配置");
            if (
                typeof (<Config>(<unknown>config)).onebot_port === "number" &&
                typeof (<Config>(<unknown>config)).onebot_host === "string"
            ) {
                conf = config;
            } else {
                log.warn("配置不正确，改为使用默认配置运行");
                conf = {
                    cookie: "",
                    onebot_host: "",
                    onebot_port: 1,
                    onebot_pw: "",
                    qq: 1,
                };
            }
        } else if (env.NODE_ENV === "dev") {
            log.warn("使用Dev配置");
            conf = config;
        } else {
            log.warn("使用默认配置");
            conf = {
                cookie: "",
                onebot_host: "",
                onebot_port: 1,
                onebot_pw: "",
                qq: 1,
            };
        }

        this.wsc = new wsClient(
            conf.onebot_host,
            conf.onebot_port as number,
            this.e,
            "qwq"
        );

        this.qqid = conf.qq;
    }
    public static getInstance() {
        this.instance || (this.instance = new QQMessage());
        return this.instance;
    }

    public wscConnect() {
        return this.wsc.connect();
    }

    public sendToGroup(groupId: number, msg: string): void {
        this.cnt++;
        this.wsc.sendMessage(
            JSON.stringify({
                action: "send_group_msg",
                params: {
                    // eslint-disable-next-line camelcase
                    group_id: groupId,
                    message: msg,
                },
            })
        );
    }

    public getId() {
        return this.qqid;
    }

    public async sendToGroupSync(groupId: number, msg: string) {
        // TODO 过长的消息截断划分，不能截断带转义的部分
        // TODO 分成多段需要保证先后顺序//mirai提前进行了返回，并不能保证这个是同步发送的
        this.wsc.sendMessage(
            JSON.stringify({
                action: "send_group_msg",
                params: {
                    // eslint-disable-next-line camelcase
                    group_id: groupId,
                    message: msg,
                },
                echo: this.cnt,
            })
        );
        return new Promise((res, rej) => {
            this.e.once(`${this.cnt}`, (ev) => {
                if ((ev as responseEvent).retcode != 0) {
                    log.warn(msg, "发送失败");
                    rej(new Error("QQ消息发送失败"));
                } else {
                    log.debug(msg, "发送成功");
                    res((ev as responseEvent).echo);
                }
            });
            this.cnt++;
        });
    }
}
const qq = QQMessage.getInstance();
export default qq;
