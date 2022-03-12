import { messageEvent } from "../../QQMessage/event.interface";
import { CmdType } from "../type";
import live from "../../Plugins/BiliLive";
import isAdmin from "../../Util/admin";

const removeLiveSubscribeByUid: CmdType.Cmd = {
    pattern: /^取消直播订阅\s\d+/,
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 2);
        const idStr = params[1];
        const id = parseInt(idStr);
        await live.removeSub(group_id, id, "uid");
    },
    cmdName: "removeLiveSubscribeByUid"
};
export default removeLiveSubscribeByUid;
