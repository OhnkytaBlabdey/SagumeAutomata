import { messageEvent } from "../../QQMessage/event.interface";
import { Cmd } from "../cmd.interface";
import config from "../../../config/config.json";
import QQMessage from "../../QQMessage";
import Logger from "../../Logger";
import path from "path";

const logopath = `file:///${(
    process.cwd() +
    path.sep +
    "ReadMe.assets/logo.jpg"
).replace(RegExp(`\\${path.sep}`, "g"), "/")}`;
const help: Cmd = {
    pattern: new RegExp(`^\\[CQ:at,qq=${config.qq}\\] 帮助`),
    exec: async (ev: messageEvent) => {
        (await QQMessage).sendToGroup(
            ev.group_id,
            // `[CQ:share,title=使用说明,content=bot支持以下功能,url=https://github.com/OhnkytaBlabdey/SagumeAutomata/blob/main/UserGuide.md,image=${logopath}]`
            `[CQ:share,title=使用说明,content=bot支持以下功能,url=https://github.com/OhnkytaBlabdey/SagumeAutomata/blob/main/UserGuide.md,image=${"https://ftp.sihaimg.com/wp-content/uploads/2019/08/7307c2ad4579a2a1994f527490224542.jpg"}]` //TODO 发送本地图片
        );
    },
};
Logger.info(logopath);
// Logger.info(help.pattern);
export default help;
