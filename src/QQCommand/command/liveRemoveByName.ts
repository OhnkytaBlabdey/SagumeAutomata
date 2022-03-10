import { messageEvent } from "../../QQMessage/event.interface";
import { CmdType } from "../type";
import live from "../../Plugins/BiliLive";
import isAdmin from "../../Util/admin";

const removeLiveSubscribeByName: CmdType.Cmd = {
    pattern: /^取消直播订阅\s[^\d]+/,
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 2);
        await live.removeSub(group_id, params[1], "name");
    },
    cmdName: "removeLiveSubscribeByName"
};
export default removeLiveSubscribeByName;
