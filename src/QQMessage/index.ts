import log from "../Logger";
import wsClient from "../WebsocketHandler";
import config from "../../config/config.json";
import {Config} from "./config.interface";
import EventEmitter from "events";
import {env} from "process";
import {messageEvent, noticeEvent, responseEvent} from "./event.interface";
import {CommandDispatcher} from "../QQCommand";
import dbm from "../DBManager";
import cmdDispatcher from "../QQCommand";
import {qqMessage} from "./interface";
import DBHandler from "../DBHandler";

const errorMessage: qqMessage.IteObjType = {
    1400: "api的请求400错误",
    1404: "api的请求404错误",
};

const defaultConfig = {
    cookie: "",
    onebot_host: "",
    onebot_port: 1,
    onebot_pw: "",
    qq: 1,
};

const handleEvent = (event: responseEvent, e: EventEmitter) => {
    let message;
    let flag = true;
    if (event.retcode !== 0 && event.retcode !== 103) {
        if (errorMessage.hasOwnProperty(event.retcode)) {
            message = errorMessage[event.retcode];
        } else {
            flag = false;
            message = "未知的retcode";
        }
    }
    if (message) {
        log.warn(message, event);
    }
    if (event.echo == null) {
        return;
    }
    flag && e.emit(Number(event.echo).toString(), event);
};

class QQMessage {
    private wsc!: wsClient;
    private e: EventEmitter;
    private cmd: CommandDispatcher;
    private db = dbm;
    private cnt = 0;
    protected qqid?: number;

    constructor() {
        if (env.MUTE && env.MUTE === "mute") {
            this.cmd = cmdDispatcher;
            this.e = new EventEmitter();
            this.qqid = 0;
        } else {
            let conf: Config;
            this.cmd = cmdDispatcher;
            this.e = new EventEmitter();
            this.e.on("qwq", async (e: string) => {
                let event: responseEvent = JSON.parse(e);
                if (event.status) {
                    // heart beat
                    if (event.post_type === "meta_event") {
                        return;
                    }
                    handleEvent(event, this.e);
                } else if (event.post_type === "message" && (<messageEvent>event).message_type === "group") {
                    const ev = <messageEvent>event;
                    const flag = this.cmd.dispatchCommand(ev, ev.message);
                    if (!flag) {
                        DBHandler.saveChatMessage(ev);
                    }
                } else if (event.post_type === "notice" && (<noticeEvent>event).notice_type === "notify") {
                    const ev = <noticeEvent>event;
                    if (ev.sub_type === "poke") {
                        // 戳一戳
                        if (ev.target_id === (<Config>config).qq) {
                            log.debug("被戳了", e);
                            this.sendToGroupSync(
                                (<noticeEvent>event).group_id,
                                `[CQ:poke,qq=${(<noticeEvent>event).user_id}]`
                            );
                        }
                    }
                }
            });
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
                    conf = defaultConfig;
                }
            } else if (env.NODE_ENV === "dev") {
                log.warn("使用Dev配置");
                conf = config;
            } else {
                log.warn("使用默认配置");
                conf = defaultConfig;
            }

            this.wsc = new wsClient(
                conf.onebot_host,
                conf.onebot_port as number,
                this.e,
                "qwq"
            );

            this.qqid = conf.qq;
        }
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
        // TODO 分成多段需要保证先后顺序 mirai提前进行了返回，并不能保证这个是同步发送的
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
            if (this.cnt === Number.MAX_VALUE) {
                this.cnt = -1;
            }
            this.cnt++;
        });
    }
}

const qq = new QQMessage();

export default qq;
