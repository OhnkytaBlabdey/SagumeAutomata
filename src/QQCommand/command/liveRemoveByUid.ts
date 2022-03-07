import { messageEvent } from "../../QQMessage/event.interface";
import { Cmd } from "../cmd.interface";
import live from "../../Service/Subscribe/Bili/BiliLive";
import isAdmin from "../../Util/admin";

const removeLiveSubscribeByUid: Cmd = {
    pattern: /^取消直播订阅\s\d+/,
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 2);
        const idStr = params[1];
        const id = parseInt(idStr);
        const sub = await live;
        sub.removeSubByUid(group_id, id);
    },
};
export default removeLiveSubscribeByUid;
