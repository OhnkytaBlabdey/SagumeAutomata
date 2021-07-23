import { messageEvent } from "../../QQMessage/event.interface";
import { cmd } from "../cmd.interface";
import config from "../../../config/config.json";
import QQMessage from "../../QQMessage";
import Logger from "../../Logger";

const help: cmd = {
    pattern: new RegExp(`^\\[CQ:at,qq=${config.qq}\\] 帮助`),
    exec: async (ev: messageEvent) => {
        (await QQMessage).sendToGroup(
            ev.group_id,
            "[CQ:share,title=使用说明,\
                url=https://github.com/OhnkytaBlabdey/SagumeAutomata/blob/main/UserGuide.md]"
        );
    },
};
Logger.warn(help.pattern);
export default help;
