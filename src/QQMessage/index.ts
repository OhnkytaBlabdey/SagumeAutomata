/* eslint-disable camelcase */
import log from "../Logger";
import wsClient from "../WebsocketHandler";
import config from "../../config/config.json";
import { Config } from "./config.interface";
import EventEmitter from "events";
import { env } from "process";
import { messageEvent, noticeEvent, responseEvent } from "./event.interface";
import dbm from "../DBManager";
import cmdDispatcher from "../QQCommand";
import { qqMessage } from "./interface";
import DBHandler from "../DBHandler";
import { string } from "random-js";

const errorMessage: qqMessage.IteObjType = {
	1400: "api的请求400错误",
	1404: "api的请求404错误",
};

const defaultConfig = {
	cookie: "",
	onebot_host: "",
	onebot_port: 1,
	onebot_pw: "",
	qq: 114514,
	qq_owner: 1919810,
	ban_words: ["哼哼啊啊啊"],
};

const handleEvent = (event: responseEvent, e: EventEmitter) => {
	let message;
	if (event.retcode !== 0 && event.retcode !== 103) {
		// eslint-disable-next-line no-prototype-builtins
		if (errorMessage.hasOwnProperty(event.retcode)) {
			message = errorMessage[event.retcode];
		} else {
			message = `未知的retcode${event.retcode}`;
		}
	}
	if (message) {
		log.warn(message, JSON.stringify(event));
	}
};

class QQMessage {
	private wsc!: wsClient;
	private e: EventEmitter;
	private db = dbm;
	private cnt = 0;
	protected qqid?: number;
	protected conf: Config = defaultConfig;

	constructor() {
		if (env.MUTE && env.MUTE === "mute") {
			this.e = new EventEmitter();
			this.qqid = 0;
		} else {
			let conf: Config;
			this.e = new EventEmitter();
			this.e.on("qwq", async (e: string) => {
				const event: responseEvent = JSON.parse(e);
				if (event.status) {
					// heart beat
					if (event.post_type === "meta_event") {
						return;
					}
					handleEvent(event, this.e);
				} else if (
					event.post_type === "message" &&
					(<messageEvent>event).message_type === "group"
				) {
					const ev = <messageEvent>event;
					const flag = await cmdDispatcher.dispatchCommand(ev, ev.message);
					if (!flag) {
						await DBHandler.saveChatMessage(ev);
					}
				} else if (
					event.post_type === "notice" &&
					(<noticeEvent>event).notice_type === "notify"
				) {
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
				"qwq",
				conf.onebot_pw ? conf.onebot_pw : ""
			);

			this.qqid = conf.qq;
			this.conf = conf;
		}
	}

	public wscConnect() {
		return this.wsc.connect();
	}
	// TODO 过长的消息截断划分，不能截断带转义的部分
	public sendToGroup(groupId: number, msg: string): void {
		// 过滤不合法模式
		let invalid = false;
		this.conf.ban_words.forEach((patt) => {
			if (RegExp(patt).test(msg)) {
				invalid = true;
				return;
			}
		});
		if (invalid) {
			log.info("试图发送不合法内容", msg);
			return;
		}
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
	// TODO 分成多段需要保证先后顺序
	// TODO go-cqhttp支持合并发送
	public sendToGroupSync(
		groupId: number,
		msgs: qqMessage.Msg[] | string[] | string
	): void {
		if (msgs instanceof string) {
			this.sendToGroup(groupId, msgs as string);
			return;
		} else {
			for (const msg of msgs as (string | qqMessage.Msg)[]) {
				if (
					(msgs as (string | qqMessage.Msg)[]).length > 0 &&
					msgs[0] instanceof string
				) {
					// 过滤不合法模式
					let invalid = false;
					this.conf.ban_words.forEach((patt) => {
						if (msg instanceof string && RegExp(patt).test(msg as string)) {
							invalid = true;
							return;
						}
					});
					if (invalid) {
						log.info("试图发送不合法内容", msg);
						return;
					}
				}
			}
			// 合并发送消息
			let forward_nodes: qqMessage.MsgNode[] = [];
			for (const msg of msgs as (string | qqMessage.Msg)[]) {
				let node: qqMessage.MsgNode = {
					type: "node",
					data: {
						name: "歪比歪比",
						uin: this.qqid as number,
						content: msg,
					},
				};
				forward_nodes.push(node);
			}
			let msg = JSON.stringify({
				action: "send_group_forward_msg",
				params: {
					group_id: groupId,
					messages: forward_nodes,
				},
			});
			this.wsc.sendMessage(msg);
		}
	}
}

const qq = new QQMessage();

export default qq;
