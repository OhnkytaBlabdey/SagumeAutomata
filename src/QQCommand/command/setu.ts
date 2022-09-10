import {messageEvent} from "../../QQMessage/event.interface";
import {CmdType} from "../type";
import setuPlugin from "../../Plugins/Setu";
import {setuInfo} from "../../Plugins/Setu/type";
import QQMessage from "../../QQMessage";
import path from "path";
import url from "url";
import scheduler from "node-schedule";
import log from "../../Logger";

let seSeCount = 0;
const seSeMaxCount = 30;
let isSeSeing = false;

const setu: CmdType.Cmd = {
    pattern: /^涩涩(\s\S+)?/,
    // pattern: /^涩涩$/,
    exec: async (ev: messageEvent) => {
        const groupId = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 2);
        const keyword = params.length > 1 ? params[1] : null;
        if (seSeCount < seSeMaxCount && !isSeSeing) {
            seSeCount += 1;
            isSeSeing = true;
            try {
                let i = await setuPlugin.getSetuUrl(keyword);
                if (i) {
                    const info = i as setuInfo;
                    try {
                        log.info("请求涩图信息成功");
                        let p = await setuPlugin.cacheSetu(info);
                        log.info("缓存涩图成功");
                        QQMessage.sendToGroup(
                            groupId,
                            `作者：${info.author}\t标题：${info.title}\n${info.url}\n[CQ:image,file=${url.pathToFileURL(p)}]\n涩涩次数:${seSeCount}/${seSeMaxCount}`
                        );
                    } catch (e) {
                        log.warn(e);
                        QQMessage.sendToGroup(
                            groupId,
                            `作者：${info.author}\t标题：${info.title}\n${info.url}\n涩涩次数:${seSeCount}/${seSeMaxCount}\n涩图请求失败o(一︿一+)o`
                        );
                    }

                } else {
                    QQMessage.sendToGroup(
                        groupId,
                        `涩图插件未开启`
                    );
                }
            } catch (e) {
                if (e) {
                    QQMessage.sendToGroup(
                        groupId,
                        `涩涩失败`
                    );
                }
            } finally {
                isSeSeing = false;
            }
            // setuPlugin.getSetuUrl(keyword)
            //     .then(async (i: setuInfo | boolean) => {
            //         if (i) {
            //             const info = i as setuInfo;
            //             try {
            //                 log.info("请求涩图信息成功");
            //                 let p = await setuPlugin.cacheSetu(info);
            //                 log.info("缓存涩图成功");
            //                 QQMessage.sendToGroup(
            //                     groupId,
            //                     `作者：${info.author}\t标题：${info.title}\n${info.url}\n[CQ:image,file=${url.pathToFileURL(p)}]\n涩涩次数:${seSeCount}/${seSeMaxCount}`
            //                 );
            //             } catch (e) {
            //                 log.warn(e);
            //                 QQMessage.sendToGroup(
            //                     groupId,
            //                     `作者：${info.author}\t标题：${info.title}\n${info.url}\n涩涩次数:${seSeCount}/${seSeMaxCount}\n涩图请求失败o(一︿一+)o`
            //                 );
            //             }
            //
            //         } else {
            //             QQMessage.sendToGroup(
            //                 groupId,
            //                 `涩图插件未开启`
            //             );
            //         }
            //     })
            //     .catch(async (e: Error) => {
            //         if (e) {
            //             QQMessage.sendToGroup(
            //                 groupId,
            //                 `涩涩失败`
            //             );
            //         }
            //     });
        } else if (seSeCount >= seSeMaxCount) {
            let p = path.resolve("data/", "noSeSe.jpg");
            QQMessage.sendToGroup(
                groupId,
                `要被榨干了！！不可以涩涩!!\n[CQ:image,file=${url.pathToFileURL(p)}]`
            );
        } else if (isSeSeing) {
            QQMessage.sendToGroup(
                groupId,
                `心急看不了好涩图`
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
