import { messageEvent } from "../../QQMessage/event.interface";
import { CmdType } from "../type";
import config from "../../../config/config.json";
import qq from "../../QQMessage";
import Logger from "../../Logger";
import path from "path";
import url from "url";

const logopath = `file:///${(
    process.cwd() +
    path.sep +
    "Assets/help.jpg"
).replace(RegExp(`\\${path.sep}`, "g"), "/")}`;
const help: CmdType.Cmd = {
    pattern: new RegExp(`^\\[CQ:at,qq=${config.qq}\\] 帮助`),
    exec: async (ev: messageEvent) => {
        qq.sendToGroup(
            ev.group_id,
            `本Bot来自项目SagumeAutomata(https://github.com/OhnkytaBlabdey/SagumeAutomata)\n号主:${config.qq_owner}\n已支持的功能: \nB站视频、动态、直播订阅提醒\n科学空间、BAIR、掘金、Github Trending订阅\nRa3单位数据速查\n随即ra笑话\nDev分支提供娱乐性功能: 墨语、莎之低语\n具体命令使用方法: https://github.com/OhnkytaBlabdey/SagumeAutomata/blob/main/UserGuide.md\n[CQ:image,file=${url.pathToFileURL(path.resolve(process.cwd(), "Assets/help.jpg"))}]`
        );
    },
    cmdName: "help"
};
Logger.info(logopath);
// Logger.info(help.pattern);
export default help;
