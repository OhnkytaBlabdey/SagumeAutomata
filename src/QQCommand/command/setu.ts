import { messageEvent } from "../../QQMessage/event.interface";
import { cmd } from "../cmd.interface";
import getSetu from "../../Setu";
import { setuInfo } from "../../Setu/setu.interface";
import QQMessage from "../../QQMessage";

const setu: cmd = {
    pattern: /^\/色图(\s\S+)?/,
    exec: async (ev: messageEvent) => {
        const groupId = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 2);
        const keyword = params.length > 1 ? params[1] : null;
        getSetu(keyword)
            .then((info: setuInfo) => {
                QQMessage.sendToGroup(
                    groupId,
                    `作者：${info.author}\t标题：${info.title}\n${info.url}\n[CQ:image,file=${info.url}]`
                );
            })
            .catch((e: Error) => {
                if (e) {
                    QQMessage.sendToGroup(
                        groupId,
                        `获取${keyword}色图失败，原因${e.message}`
                    );
                }
            });
    },
};

export default setu;
