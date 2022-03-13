import { messageEvent } from "../../QQMessage/event.interface";
import { CmdType } from "../type";
import config from "../../../config/config.json";
import qq from "../../QQMessage";
import Logger from "../../Logger";
import path from "path";

const logopath = `file:///${(
    process.cwd() +
    path.sep +
    "ReadMe.Assets/logo.jpg"
).replace(RegExp(`\\${path.sep}`, "g"), "/")}`;
const help: CmdType.Cmd = {
    pattern: new RegExp(`^\\[CQ:at,qq=${config.qq}\\] 帮助`),
    exec: async (ev: messageEvent) => {
        qq.sendToGroup(
            ev.group_id,
            // `[CQ:share,title=使用说明,content=bot支持以下功能,url=https://hub.fastgit.org/OhnkytaBlabdey/SagumeAutomata/blob/main/UserGuide.md,image=${logopath}]`
            `[CQ:share,title=使用说明,content=bot支持以下功能,url=https://hub.fastgit.org/OhnkytaBlabdey/SagumeAutomata/blob/main/UserGuide.md,image=${"https://ftp.sihaimg.com/wp-content/uploads/2019/08/7307c2ad4579a2a1994f527490224542.jpg"}]` //TODO 发送本地图片
        );
    },
    cmdName: "help"
};
Logger.info(logopath);
// Logger.info(help.pattern);
export default help;
