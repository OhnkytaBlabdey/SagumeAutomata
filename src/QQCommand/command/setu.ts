import { messageEvent } from "../../QQMessage/event.interface";
import { CmdType } from "../type";
import setuPlugin from "../../Plugins/Setu";
import { setuInfo } from "../../Plugins/Setu/type";
import QQMessage from "../../QQMessage";

const setu: CmdType.Cmd = {
	pattern: /^\/色图(\s\S+)?/,
	exec: async (ev: messageEvent) => {
		const groupId = ev.group_id;
		const params = ev.message.split(RegExp(/\s/), 2);
		const keyword = params.length > 1 ? params[1] : null;
		setuPlugin
			.getSetuUrl(keyword)
			.then(async (i: setuInfo | boolean) => {
				if (i) {
					const info = i as setuInfo;
					QQMessage.sendToGroup(
						groupId,
						`作者：${info.author}\t标题：${info.title}\n${info.url}\n[CQ:image,file=${info.url}]`
					); /* .catch(async (e: any) => {
						if (e) {
							QQMessage.sendToGroup(
								groupId,
								`作者：${info.author}\t标题：${info.title}\n${
									info.url
								}\n 图片发送失败原因${JSON.stringify(e)}`
							);
						}
					}); */
				} else {
					QQMessage.sendToGroup(groupId, `插件未开启`);
				}
			})
			.catch(async (e: Error) => {
				if (e) {
					QQMessage.sendToGroup(
						groupId,
						`获取${keyword}色图失败，原因${e.message}`
					);
				}
			});
	},
	cmdName: "setu",
};

export default setu;
