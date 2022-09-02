import {messageEvent} from "../../QQMessage/event.interface";
import {CmdType} from "../type";
import setuPlugin from "../../Plugins/Setu";
import {setuInfo} from "../../Plugins/Setu/type";
import QQMessage from "../../QQMessage";
import logger from "../../Logger";
import path from "path";
import url from "url";
import scheduler from "node-schedule";

let seSeCount = 0;
let isSeSeing = false;
const seSeMaxCount = 15;

const setu: CmdType.Cmd = {
    // pattern: /^涩涩(\s\S+)?/,
    pattern: /^涩涩$/,
    exec: async (ev: messageEvent) => {
        const groupId = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 2);
        const keyword = params.length > 1 ? params[1] : null;
        if (seSeCount < seSeMaxCount && !isSeSeing) {
            seSeCount += 1;
            isSeSeing = true;
            setuPlugin.getSetuUrl(keyword)
                .then(async (i: setuInfo | boolean) => {
                    isSeSeing = false;
                    if (i) {
                        const info = i as setuInfo;
                        QQMessage.sendToGroupSync(
                            groupId,
                            `作者：${info.author}\t标题：${info.title}\n${info.url}\n[CQ:image,file=${info.url}]\n涩涩次数:${seSeCount}/${seSeMaxCount}`
                        ).catch(async (e) => {
                            if (e) {
                                logger.warn(JSON.stringify(e));
                                QQMessage.sendToGroup(
                                    groupId,
                                    `作者：${info.author}\t标题：${info.title}\n${
                                        info.url
                                    }\n 涩涩失败`
                                );
                            }
                        });
                    } else {
                        QQMessage.sendToGroup(
                            groupId,
                            `涩图插件未开启`
                        );
                    }
                })
                .catch(async (e: Error) => {
                    isSeSeing = false;
                    if (e) {
                        QQMessage.sendToGroup(
                            groupId,
                            `涩涩失败`
                        );
                    }
                });
        } else if (seSeCount >= seSeMaxCount) {
            let p = path.resolve("data/", "noSeSe.jpg");
            QQMessage.sendToGroup(
                groupId,
                `要被榨干了！！不可以涩涩!!\n[CQ:image,file=${url.pathToFileURL(p)}]`
            );
        } else if (isSeSeing) {
            QQMessage.sendToGroup(
                groupId,
                `正在涩涩，别急~`
            );
        }
    },
    cmdName: "setu"
};

scheduler.scheduleJob(
    "0 0 1 * * *",
    () => {
        seSeCount = 0;
    }
);

export default setu;
