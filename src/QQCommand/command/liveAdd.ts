import { messageEvent } from "../../QQMessage/event.interface";
import { CmdType } from "../type";
import live from "../../Plugins/BiliLive";
import isAdmin from "../../Util/admin";

const addLiveSubscribe: CmdType.Cmd = {
    pattern: /^直播订阅\s\d+\s\S+/,
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 3);
        const idStr = params[1];
        const id = parseInt(idStr);
        await live.addSub(group_id, id, params[2]);
    },
    cmdName: "addLiveSubscribe"
};
export default addLiveSubscribe;
