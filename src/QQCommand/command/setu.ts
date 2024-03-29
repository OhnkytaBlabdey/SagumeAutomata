import { messageEvent } from "../../QQMessage/event.interface";
import { CmdType } from "../type";
import setuPlugin from "../../Plugins/Setu";
import { setuInfo } from "../../Plugins/Setu/type";
import QQMessage from "../../QQMessage";
import path from "path";
import url from "url";
import scheduler from "node-schedule";
import log from "../../Logger";
import { getPluginInfo } from "../../Util/configParser";

let seSeCount = 0;
const seSeMaxCount = 30;
const pixivProxy = "https://px2.rainchan.win/img/regular/";

interface pluginConfType {
	name: string;
	on: boolean;
}

const setu: CmdType.Cmd = {
	pattern: /^涩涩(\s\S+)?/,
	// pattern: /^涩涩$/,
	exec: async (ev: messageEvent) => {
		const groupId = ev.group_id;
		const params = ev.message.split(RegExp(/\s/), 2);
		const keyword = params.length > 1 ? params[1] : null;
		const pluginInfo = getPluginInfo("Setu");
		if (pluginInfo && pluginInfo.on) {
			try {
				let i = await setuPlugin.getSetuUrl(keyword);
				if (i) {
					if (seSeCount < seSeMaxCount) {
						seSeCount += 1;
						const info = i as setuInfo;
						let isNSFW = info.tags.findIndex((value) => value === "R-18");
						try {
							log.info("请求涩图信息成功");
							let p = path.resolve("data/", "noSeSe.jpg");
							QQMessage.sendToGroup(
								groupId,
								`[CQ:image,file=${
									isNSFW > -1 ? url.pathToFileURL(p) : pixivProxy + info.pid
								}]\n作者：${info.author}\n标题：${info.title}\n${
									info.url
								}\n标签：${info.tags.join(
									","
								)}\n涩涩次数:${seSeCount}/${seSeMaxCount}`
							);
						} catch (e) {
							log.warn(e);
							QQMessage.sendToGroup(
								groupId,
								`作者：${info.author}\t标题：${info.title}\n${info.url}\n涩涩次数:${seSeCount}/${seSeMaxCount}\n涩图请求失败o(一︿一+)o`
							);
						}
					} else if (seSeCount >= seSeMaxCount) {
						let p = path.resolve("data/", "noSeSe.jpg");
						QQMessage.sendToGroup(
							groupId,
							`要被榨干了！！不可以涩涩!!\n[CQ:image,file=${url.pathToFileURL(
								p
							)}]`
						);
					}
				} else {
					QQMessage.sendToGroup(groupId, `涩图插件未开启`);
				}
			} catch (e) {
				if (e) {
					QQMessage.sendToGroup(groupId, e as string);
				}
			}
		} else if (pluginInfo && !pluginInfo.on) {
			let p = path.resolve("data/", "noSeSe.jpg");
			QQMessage.sendToGroup(
				groupId,
				`不可以涩涩!!涩涩密接！！\n[CQ:image,file=${url.pathToFileURL(p)}]`
			);
		}
	},
	cmdName: "setu",
};

scheduler.scheduleJob("0 0 1 * * *", () => {
	seSeCount = 0;
});

export default setu;
