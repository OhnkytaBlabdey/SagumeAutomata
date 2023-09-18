import log from "../Logger";
import wsClient from "../WebsocketHandler";
import configHandler from "../ConfigHandler";
import EventEmitter from "events";
import { env } from "process";
import { messageEvent, noticeEvent, responseEvent } from "./event.interface";
import dbm from "../DBManager";
import qqCommand from "../QQCommand";
import { qqMessage } from "./interface";
import DBHandler from "../DBHandler";
import { string } from "random-js";

const errorMessage: qqMessage.IteObjType = {
	1400: "api的请求400错误",
	1404: "api的请求404错误",
};

const handleEvent = (event: responseEvent, e: EventEmitter) => {
	let message;
	if (event.retcode !== 0 && event.retcode !== 103) {
		if (Object.prototype.hasOwnProperty.call(errorMessage, event.retcode)) {
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

	constructor() {
		if (env.MUTE && env.MUTE === "mute") {
			this.e = new EventEmitter();
		} else {
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
					let taskFlag = false;
					const flag = await qqCommand.dispatchCommand(ev, ev.message);
					if (!flag) {
						taskFlag = await qqCommand.handleTasks(ev);
					}
					if (!taskFlag) {
						await DBHandler.saveChatMessage(ev);
					}
				} else if (
					event.post_type === "notice" &&
					(<noticeEvent>event).notice_type === "notify"
				) {
					const ev = <noticeEvent>event;
					if (ev.sub_type === "poke") {
						// 戳一戳
						if (ev.target_id === configHandler.getGlobalConfig().qq) {
							log.debug("被戳了", e);
							this.sendToGroup(
								(<noticeEvent>event).group_id,
								`[CQ:poke,qq=${(<noticeEvent>event).user_id}]`
							);
						}
					}
				}
			});
		}
	}

	public wscConnect() {
		this.wsc = new wsClient(
			configHandler.getGlobalConfig().bot_host,
			configHandler.getGlobalConfig().bot_port,
			this.e,
			"qwq",
			configHandler.getGlobalConfig().bot_access_token.length > 0
				? configHandler.getGlobalConfig().bot_access_token
				: ""
		);
		return this.wsc.connect();
	}
	// TODO 过长的消息截断划分，不能截断带转义的部分
	public sendToGroup(groupId: number, msg: string): void {
		// 过滤不合法模式
		let invalid = false;
		configHandler.getGlobalConfig().ban_words.forEach((patt) => {
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
	// TODO 分成多段需要保证先后顺序
	// TODO go-cqhttp支持合并发送
	public sendToGroupSync(
		groupId: number,
		msgs: qqMessage.Msg[] | string[] | string
	): void {
		if (msgs instanceof string) {
			this.sendToGroup(groupId, msgs as unknown as string);
			return;
		} else {
			for (const msg of msgs as (string | qqMessage.Msg)[]) {
				if (
					(msgs as (string | qqMessage.Msg)[]).length > 0 &&
					msgs[0] instanceof string
				) {
					// 过滤不合法模式
					let invalid = false;
					configHandler.getGlobalConfig().ban_words.forEach((patt) => {
						if (
							msg instanceof string &&
							RegExp(patt).test(msg as unknown as string)
						) {
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
						uin: configHandler.getGlobalConfig().qq,
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
