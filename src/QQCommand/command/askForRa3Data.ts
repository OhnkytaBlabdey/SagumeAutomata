import { messageEvent } from "../../QQMessage/event.interface";
import { CmdType } from "../type";
import ra3Wiki from "../../Plugins/Ra3Wiki";

const askForRa3Data: CmdType.Cmd = {
    pattern: /^ra3单位\s[^\d]+/,
    exec: async (ev: messageEvent) => {
        const group_id = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 2);
        await ra3Wiki.getWikiInfo(group_id, params[1]);
    },
    cmdName: "askForRa3Data"
}

export default askForRa3Data;
