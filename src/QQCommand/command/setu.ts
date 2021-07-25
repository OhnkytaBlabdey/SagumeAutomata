import { messageEvent } from "../../QQMessage/event.interface";
import { cmd } from "../cmd.interface";
import getSetu from "../../Service/Setu";
import { setuInfo } from "../../Service/Setu/setu.interface";
import QQMessage from "../../QQMessage";

const setu: cmd = {
    pattern: /^\/色图(\s\S+)?/,
    exec: async (ev: messageEvent) => {
        const groupId = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 2);
        const keyword = params.length > 1 ? params[1] : null;
        getSetu(keyword)
            .then(async (info: setuInfo) => {
                (await QQMessage)
                    .sendToGroupSync(
                        groupId,
                        `作者：${info.author}\t标题：${info.title}\n${info.url}\n[CQ:image,file=${info.url}]`
                    )
                    .catch(async (e) => {
                        if (e) {
                            (await QQMessage).sendToGroup(
                                groupId,
                                `作者：${info.author}\t标题：${info.title}\n${
                                    info.url
                                }\n 图片发送失败原因${JSON.stringify(e)}`
                            );
                        }
                    });
            })
            .catch(async (e: Error) => {
                if (e) {
                    (await QQMessage).sendToGroup(
                        groupId,
                        `获取${keyword}色图失败，原因${e.message}`
                    );
                }
            });
    },
};

export default setu;
